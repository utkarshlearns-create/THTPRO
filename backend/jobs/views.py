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
    NotificationSerializer,
    ApplicationSerializer
)
from .utils import assign_job_to_admin, send_notification
from users.models import TutorProfile
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


class TutorApplicationsView(APIView):
    """Get all applications submitted by the tutor"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can view applications"}, status=403)
        
        try:
            # Get tutor profile
            tutor_profile = TutorProfile.objects.get(user=request.user)
            
            # Get all applications by this tutor
            applications = Application.objects.filter(tutor=tutor_profile).select_related('job').order_by('-created_at')
            
            # Filter by status if provided
            status_filter = request.query_params.get('status', None)
            if status_filter:
                applications = applications.filter(status=status_filter.upper())
            
            serializer = ApplicationSerializer(applications, many=True)
            
            # Calculate stats
            stats = {
                'total': applications.count(),
                'applied': applications.filter(status='APPLIED').count(),
                'shortlisted': applications.filter(status='SHORTLISTED').count(),
                'hired': applications.filter(status='HIRED').count(),
                'rejected': applications.filter(status='REJECTED').count(),
            }
            
            return Response({
                'applications': serializer.data,
                'stats': stats
            })
            
        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor profile not found"}, status=404)
        except Exception as e:
            logger.error(f"Error fetching applications: {str(e)}")
            return Response({"error": str(e)}, status=500)


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
        
        # Mark admin task as completed
        try:
            task = AdminTask.objects.get(job_post=job_post, admin=request.user, status='PENDING')
            task.status = 'COMPLETED'
            task.completed_at = timezone.now()
            task.save()
        except AdminTask.DoesNotExist:
            pass
        
        # Send notification to tutor
        if job_post.posted_by:
            send_notification(
                user=job_post.posted_by,
                notification_type='JOB_APPROVED',
                message=f"Your job post for {job_post.class_grade} has been approved!",
                related_job=job_post
            )
        
        return Response({"message": "Job approved successfully", "job_id": job_post.id})


class AdminRejectJobView(APIView):
    """Admin rejects a job post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
        
        job_post = get_object_or_404(JobPost, pk=pk, assigned_admin=request.user)
        reason = request.data.get('reason', 'Does not meet platform guidelines')
        
        job_post.status = 'REJECTED'
        job_post.rejection_reason = reason
        job_post.save()
        
        # Mark admin task as completed
        try:
            task = AdminTask.objects.get(job_post=job_post, admin=request.user, status='PENDING')
            task.status = 'COMPLETED'
            task.completed_at = timezone.now()
            task.save()
        except AdminTask.DoesNotExist:
            pass
        
        # Send notification to tutor
        if job_post.posted_by:
            send_notification(
                user=job_post.posted_by,
                notification_type='JOB_REJECTED',
                message=f"Your job post was rejected. Reason: {reason}",
                related_job=job_post
            )
        
        return Response({"message": "Job rejected", "reason": reason})


class AdminRequestModificationsView(APIView):
    """Admin requests modifications to a job post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
        
        job_post = get_object_or_404(JobPost, pk=pk, assigned_admin=request.user)
        feedback = request.data.get('feedback', 'Please review and update your job post')
        
        job_post.status = 'MODIFICATIONS_NEEDED'
        job_post.modification_feedback = feedback
        job_post.save()
        
        # Send notification to tutor
        if job_post.posted_by:
            send_notification(
                user=job_post.posted_by,
                notification_type='JOB_MODIFICATION_NEEDED',
                message=f"Modifications needed for your job post. Feedback: {feedback}",
                related_job=job_post
            )
        
        return Response({"message": "Modification request sent", "feedback": feedback})


# ==================== PARENT ENDPOINTS ====================

class ParentJobListView(generics.ListAPIView):
    """List all approved jobs for parents to browse"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Only show approved jobs
        return JobPost.objects.filter(status='APPROVED').order_by('-created_at')


class JobDetailView(generics.RetrieveAPIView):
    """Get details of a specific job"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]
    queryset = JobPost.objects.filter(status='APPROVED')


# ==================== NOTIFICATION ENDPOINTS ====================

class NotificationListView(generics.ListAPIView):
    """List all notifications for the current user"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class MarkNotificationReadView(APIView):
    """Mark a notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read"})
