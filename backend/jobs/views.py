from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import JobPost, Application
from .admin_models import AdminTask, Notification
from .serializers import (
    JobPostSerializer, 
    TutorJobPostSerializer,
    AdminTaskSerializer,
    NotificationSerializer
)
from .utils import assign_job_to_admin, send_notification
import logging

logger = logging.getLogger(__name__)


# ==================== TUTOR ENDPOINTS ====================

class TutorJobCreateView(APIView):
    """Tutor creates a job opportunity post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can post job opportunities"}, status=403)
        
        serializer = TutorJobPostSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Create job post with pending status
                job_post = serializer.save(
                    posted_by=request.user,
                    status='PENDING_APPROVAL'
                )
                
                # Auto-assign to admin with load balancing
                assigned_admin = assign_job_to_admin(job_post)
                
                logger.info(f"Job {job_post.id} created by tutor {request.user.username} and assigned to admin {assigned_admin.username}")
                
                return Response({
                    "message": "Job posted successfully! It's being reviewed by our team.",
                    "job_id": job_post.id,
                    "status": job_post.status,
                    "assigned_to": assigned_admin.username
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Error creating job post: {str(e)}")
                if 'job_post' in locals():
                    job_post.delete()
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TutorJobListView(generics.ListAPIView):
    """List tutor's own job posts"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'TEACHER':
            return JobPost.objects.none()
        return JobPost.objects.filter(posted_by=self.request.user).order_by('-created_at')


# ==================== ADMIN ENDPOINTS ====================

class AdminPendingJobsView(generics.ListAPIView):
    """Admin views jobs assigned to them for approval"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return JobPost.objects.none()
        
        # Show jobs assigned to this admin that are pending
        return JobPost.objects.filter(
            assigned_admin=self.request.user,
            status='PENDING_APPROVAL'
        ).order_by('-created_at')


class AdminApproveJobView(APIView):
    """Admin approves a job post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
        
        job_post = get_object_or_404(JobPost, pk=pk, assigned_admin=request.user)
        
        job_post.status = 'APPROVED'
        job_post.save()
        
        # Update AdminTask
        AdminTask.objects.filter(job_post=job_post, admin=request.user, status='PENDING').update(
            status='COMPLETED',
            completed_at=timezone.now()
        )
        
        # Notify tutor
        send_notification(
            user=job_post.posted_by,
            title="Job Approved! 🎉",
            message=f"Your job posting for {job_post.class_grade} {', '.join(job_post.subjects)} has been approved and is now visible to parents.",
            notification_type='JOB_APPROVED',
            related_job=job_post
        )
        
        logger.info(f"Job {job_post.id} approved by admin {request.user.username}")
        
        return Response({
            "message": "Job approved successfully",
            "job_id": job_post.id
        })


class AdminRejectJobView(APIView):
    """Admin rejects a job post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
        
        job_post = get_object_or_404(JobPost, pk=pk, assigned_admin=request.user)
        reason = request.data.get('reason', 'No reason provided')
        
        job_post.status = 'REJECTED'
        job_post.rejection_reason = reason
        job_post.save()
        
        # Update AdminTask
        AdminTask.objects.filter(job_post=job_post, admin=request.user, status='PENDING').update(
            status='COMPLETED',
            completed_at=timezone.now(),
            notes=reason
        )
        
        # Notify tutor
        send_notification(
            user=job_post.posted_by,
            title="Job Posting Rejected",
            message=f"Your job posting was rejected. Reason: {reason}",
            notification_type='JOB_REJECTED',
            related_job=job_post
        )
        
        logger.info(f"Job {job_post.id} rejected by admin {request.user.username}")
        
        return Response({
            "message": "Job rejected",
            "job_id": job_post.id
        })


class AdminRequestModificationsView(APIView):
    """Admin requests modifications to a job post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
        
        job_post = get_object_or_404(JobPost, pk=pk, assigned_admin=request.user)
        feedback = request.data.get('feedback', '')
        
        job_post.status = 'MODIFICATIONS_NEEDED'
        job_post.modification_feedback = feedback
        job_post.save()
        
        # Notify tutor
        send_notification(
            user=job_post.posted_by,
            title="Modifications Requested",
            message=f"Please update your job posting. Feedback: {feedback}",
            notification_type='MODIFICATIONS_REQUESTED',
            related_job=job_post
        )
        
        logger.info(f"Modifications requested for job {job_post.id} by admin {request.user.username}")
        
        return Response({
            "message": "Modification request sent",
            "job_id": job_post.id
        })


# ==================== PARENT ENDPOINTS ====================

class ParentApprovedJobsView(generics.ListAPIView):
    """Parents see only approved job opportunities"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'PARENT':
            return JobPost.objects.none()
        
        # Show only approved jobs
        return JobPost.objects.filter(status='APPROVED').order_by('-created_at')


# ==================== NOTIFICATION ENDPOINTS ====================

class UserNotificationsView(generics.ListAPIView):
    """Get user's notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)[:50]


class MarkNotificationReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read"})


class UnreadNotificationCountView(APIView):
    """Get count of unread notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


# ==================== EXISTING ENDPOINTS (Keep for compatibility) ====================

class JobPostListCreateView(generics.ListCreateAPIView):
    """Legacy endpoint - kept for backward compatibility"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Parents see approved jobs
        if self.request.user.role == 'PARENT':
            return JobPost.objects.filter(status='APPROVED').order_by('-created_at')
        # Tutors see their own posts
        elif self.request.user.role == 'TEACHER':
            return JobPost.objects.filter(posted_by=self.request.user).order_by('-created_at')
        # Admins see all
        elif self.request.user.role in ['ADMIN', 'SUPERADMIN']:
            return JobPost.objects.all().order_by('-created_at')
        return JobPost.objects.none()

    def perform_create(self, serializer):
        # This is now deprecated - use TutorJobCreateView instead
        serializer.save(posted_by=self.request.user, status='PENDING_APPROVAL')


class JobPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]


class ParentDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'PARENT':
            return Response({"error": "Not a parent"}, status=403)
        
        # Stats for parent dashboard
        jobs = JobPost.objects.filter(parent=user)
        total_jobs = jobs.count()
        
        total_applications = Application.objects.filter(job__parent=user).count()
        
        hired_app = Application.objects.filter(job__parent=user, status='HIRED').last()
        assigned_tutor_name = "None"
        if hired_app:
            assigned_tutor_name = hired_app.tutor.user.username
            
        return Response({
            "jobs_posted": total_jobs,
            "applications_received": total_applications,
            "assigned_tutor": assigned_tutor_name
        })
