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
from users.models import TutorProfile, TutorKYC
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()
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


class JobCreateView(APIView):
    """Allow Parents (and Tutors) to create a job opportunity post"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Allow both Parents and Teachers (Teachers might post for substitutes, Parents for tutors)
        if request.user.role not in ['PARENT', 'TEACHER', 'ADMIN', 'SUPERADMIN']:
             return Response({"error": "You must be logged in as a Parent or Tutor to post a job."}, status=403)
        
        # Use the same serializer structure for now
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
                
                logger.info(f"Job {job_post.id} created by {request.user.role} {request.user.username} and assigned to {assigned_admin.username}")
                
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


class MyJobPostsView(generics.ListAPIView):
    """List current user's own job posts (Parent or Tutor)"""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
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


class JobApplicationCreateView(APIView):
    """Tutor applies for a job"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can apply for jobs"}, status=403)
        
        job = get_object_or_404(JobPost, pk=pk)
        
        if job.status != 'APPROVED':
             return Response({"error": "Job is not accepting applications"}, status=400)
             
        # Check if already applied
        try:
             tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
             return Response({"error": "Complete your tutor profile first"}, status=400)
             
        if Application.objects.filter(job=job, tutor=tutor_profile).exists():
             return Response({"error": "You have already applied for this job"}, status=400)
             
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
             serializer.save(job=job, tutor=tutor_profile)
             
             # Notify Parent
             if job.posted_by:
                  send_notification(
                      user=job.posted_by,
                      title="New Tutor Application",
                      message=f"{tutor_profile.full_name} has applied for your {job.class_grade} job!",
                      notification_type='SYSTEM', # Or NEW_APPLICATION
                      related_job=job
                  )
             
             return Response({"message": "Application submitted successfully!"}, status=201)
        return Response(serializer.errors, status=400)


class JobApplicantsView(generics.ListAPIView):
    """Parent views applicants for a specific job"""
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        job_id = self.kwargs['pk']
        # Ensure user is owner of job
        job = get_object_or_404(JobPost, pk=job_id)
        if job.posted_by != self.request.user:
             return Application.objects.none() # Or raise permission denied
             
        return Application.objects.filter(job=job).select_related('tutor__user').order_by('-created_at')


# ==================== ADMIN ENDPOINTS ====================

class AdminDashboardStatsView(APIView):
    """
    Get aggregated statistics for Admin Dashboard.
    Supports department-based stats via 'department' query param or user profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
        
        # Base counts
        total_tutors = TutorProfile.objects.count()
        total_parents = User.objects.filter(role='PARENT').count()
        active_jobs = JobPost.objects.filter(status='APPROVED').count()
        pending_jobs = JobPost.objects.filter(status='PENDING_APPROVAL').count()
        pending_kyc = TutorKYC.objects.filter(status='SUBMITTED').count()
        
        # Check Department
        department = 'SUPERADMIN'
        if hasattr(request.user, 'admin_profile'):
            department = request.user.admin_profile.department
            
        # Optional: Revenue calc (placeholder)
        total_revenue = 0 
        
        stats = {
            "total_tutors": total_tutors,
            "total_parents": total_parents,
            "active_jobs": active_jobs,
            "pending_jobs": pending_jobs,
            "pending_kyc": pending_kyc,
            "total_revenue": total_revenue,
            "department": department
        }
        
        return Response(stats)


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


class JobSearchFilterView(generics.ListAPIView):
    """
    Advanced Job Search for Tutors.
    Filters: subject, grade, location, budget_min, budget_max
    """
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny] # Generating leads usually public, or Auth required? Tutors usually need to be logged in to apply, but search can be open.
    
    def get_queryset(self):
        queryset = JobPost.objects.filter(status='APPROVED').order_by('-created_at')
        
        # Text Search (Subject/Grade/Location)
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(
                Q(subjects__icontains=q) | 
                Q(class_grade__icontains=q) |
                Q(locality__icontains=q)
            )
            
        # Specific Filters
        subject = self.request.query_params.get('subject', None)
        if subject:
             queryset = queryset.filter(subjects__icontains=subject)
             
        grade = self.request.query_params.get('grade', None)
        if grade:
             queryset = queryset.filter(class_grade__icontains=grade)
             
        location = self.request.query_params.get('location', None)
        if location:
             queryset = queryset.filter(locality__icontains=location)
             
        min_budget = self.request.query_params.get('min_budget', None)
        if min_budget:
             queryset = queryset.filter(budget_min__gte=min_budget)
             
        return queryset


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


class ParentStatsView(APIView):
    """Get dashboard stats for parent"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'PARENT':
             return Response({"error": "Only parents can view stats"}, status=403)
             
        # Calculate stats
        jobs_posted = JobPost.objects.filter(posted_by=request.user).count()
        applications_received = Application.objects.filter(job__posted_by=request.user).count()
        
        # Logic for assigned tutor (e.g. from accepted applications)
        assigned_tutor = 'None'
        hire = Application.objects.filter(job__posted_by=request.user, status='HIRED').first()
        if hire:
            assigned_tutor = hire.tutor.full_name
            
        return Response({
            "jobs_posted": jobs_posted,
            "applications_received": applications_received,
            "assigned_tutor": assigned_tutor
        })
