"""
Admin-facing job views: dashboard stats, job approval/rejection, tutor assignment.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import JobPost, Application
from .admin_models import AdminTask
from .serializers import JobPostSerializer
from .utils import send_notification
from users.models import TutorProfile, TutorKYC
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminDashboardStatsView(APIView):
    """Get aggregated statistics for Admin Dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)

        department = 'SUPERADMIN'
        if hasattr(request.user, 'admin_profile'):
            department = request.user.admin_profile.department

        stats = {
            "total_tutors": TutorProfile.objects.count(),
            "total_parents": User.objects.filter(role='PARENT').count(),
            "active_jobs": JobPost.objects.filter(status='APPROVED').count(),
            "pending_jobs": JobPost.objects.filter(status='PENDING_APPROVAL').count(),
            "pending_kyc": TutorKYC.objects.filter(status='SUBMITTED').count(),
            "total_revenue": 0,
            "department": department,
        }
        return Response(stats)


class AdminPendingJobsView(generics.ListAPIView):
    """Admin views jobs assigned to them for approval."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR']:
            return JobPost.objects.none()
        
        # If it's a superadmin or admin, maybe they should see all pending jobs?
        # Or if the system strictly assigns jobs to specific admins:
        if self.request.user.role == 'SUPERADMIN':
            return JobPost.objects.filter(status='PENDING_APPROVAL').select_related('posted_by', 'assigned_admin').order_by('-created_at')
            
        return JobPost.objects.filter(
            status='PENDING_APPROVAL',
        ).select_related('posted_by', 'assigned_admin').order_by('-created_at')

class AdminJobListView(generics.ListAPIView):
    """Admin views jobs strictly filtered by an optional status parameter."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR', 'TUTOR_ADMIN']:
            return JobPost.objects.none()
            
        status_param = self.request.query_params.get('status')
        queryset = JobPost.objects.all().select_related('posted_by', 'assigned_admin').order_by('-created_at')
        
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
            
        # Optional: Admins and Counsellors might only see specific jobs, but the prompt says they want an Approved/Rejected jobs list.
        # usually all approved/rejected jobs are visible.
        return queryset


class AdminInstitutionJobListView(generics.ListAPIView):
    """List all pending jobs posted by Institutions for Admin approval."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR']:
            return JobPost.objects.none()
        return JobPost.objects.filter(
            status='PENDING_APPROVAL',
            posted_by__role='INSTITUTION',
        ).select_related('posted_by', 'assigned_admin').order_by('-created_at')


def _complete_admin_task(job_post, admin_user):
    """Helper to mark an admin task as completed."""
    try:
        task = AdminTask.objects.get(job_post=job_post, admin=admin_user, status='PENDING')
        task.status = 'COMPLETED'
        task.completed_at = timezone.now()
        task.save()
    except AdminTask.DoesNotExist:
        pass


class AdminApproveJobView(APIView):
    """Admin approves a job post."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR']:
            return Response({"error": "Admin access required"}, status=403)

        # Allow Superadmins to approve any job, but Admins/Counsellors only if assigned to them or if it's currently unassigned.
        if request.user.role == 'SUPERADMIN':
            job_post = get_object_or_404(JobPost, pk=pk)
        else:
            # You might want to allow counsellors to approve any pending job, not just those assigned.
            # Let's just fetch the job. If assignment is strict, add `assigned_admin=request.user`
            job_post = get_object_or_404(JobPost, pk=pk)
        job_post.status = 'APPROVED'
        job_post.save()

        _complete_admin_task(job_post, request.user)

        if job_post.posted_by:
            send_notification(
                user=job_post.posted_by,
                title='Job Approved',
                notification_type='JOB_APPROVED',
                message=f"Your job post for {job_post.class_grade} has been approved!",
                related_job=job_post,
            )
        return Response({"message": "Job approved successfully", "job_id": job_post.id})


class AdminRejectJobView(APIView):
    """Admin rejects a job post."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR']:
            return Response({"error": "Admin access required"}, status=403)

        if request.user.role == 'SUPERADMIN':
            job_post = get_object_or_404(JobPost, pk=pk)
        else:
            job_post = get_object_or_404(JobPost, pk=pk)
        reason = request.data.get('reason', 'Does not meet platform guidelines')

        job_post.status = 'REJECTED'
        job_post.rejection_reason = reason
        job_post.save()

        _complete_admin_task(job_post, request.user)

        if job_post.posted_by:
            send_notification(
                user=job_post.posted_by,
                title='Job Rejected',
                notification_type='JOB_REJECTED',
                message=f"Your job post was rejected. Reason: {reason}",
                related_job=job_post,
            )
        return Response({"message": "Job rejected", "reason": reason})


class AdminRequestModificationsView(APIView):
    """Admin requests modifications to a job post."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR']:
            return Response({"error": "Admin access required"}, status=403)

        if request.user.role == 'SUPERADMIN':
            job_post = get_object_or_404(JobPost, pk=pk)
        else:
            job_post = get_object_or_404(JobPost, pk=pk)
        feedback = request.data.get('feedback', 'Please review and update your job post')

        job_post.status = 'MODIFICATIONS_NEEDED'
        job_post.modification_feedback = feedback
        job_post.save()

        if job_post.posted_by:
            send_notification(
                user=job_post.posted_by,
                title='Modifications Needed',
                notification_type='JOB_MODIFICATION_NEEDED',
                message=f"Modifications needed for your job post. Feedback: {feedback}",
                related_job=job_post,
            )
        return Response({"message": "Modification request sent", "feedback": feedback})


class AdminAssignTutorView(APIView):
    """Admin manually assigns a tutor to a job."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN', 'COUNSELLOR']:
            return Response({"error": "Admin access required"}, status=403)

        job_post = get_object_or_404(JobPost, pk=pk)
        tutor_id = request.data.get('tutor_id')
        demo_date = request.data.get('demo_date')

        if not tutor_id:
            return Response({"error": "Tutor ID is required"}, status=400)

        try:
            tutor_profile = TutorProfile.objects.get(pk=tutor_id)
        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor not found"}, status=404)

        application, created = Application.objects.get_or_create(job=job_post, tutor=tutor_profile)
        application.status = 'HIRED'
        if demo_date:
            application.demo_date = demo_date
        application.save()

        job_post.status = 'ASSIGNED'
        job_post.save()

        demo_msg = f" A demo has been scheduled for {demo_date}." if demo_date else ""

        send_notification(
            user=tutor_profile.user,
            title='Job Assigned',
            notification_type='SYSTEM',
            message=f"You have been manually assigned to the job: {job_post.class_grade} - {job_post.subjects}.{demo_msg}",
            related_job=job_post,
        )

        if job_post.parent:
            send_notification(
                user=job_post.parent,
                title='Tutor Assigned',
                notification_type='SYSTEM',
                message=f"A tutor ({tutor_profile.full_name}) has been assigned to your job request.{demo_msg}",
                related_job=job_post,
            )

        return Response({
            "message": f"Job assigned to {tutor_profile.full_name}",
            "job_id": job_post.id,
            "tutor_id": tutor_profile.id,
            "status": "ASSIGNED",
        })
