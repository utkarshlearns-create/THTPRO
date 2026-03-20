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
from .serializers import JobPostSerializer, AdminJobUpdateSerializer
from .utils import send_notification
from users.models import TutorProfile, TutorKYC
from django.contrib.auth import get_user_model
from core.roles import ADMIN_ROLES, COUNSELLOR, SUPERADMIN, TUTOR_ADMIN

User = get_user_model()


class AdminDashboardStatsView(APIView):
    """Get aggregated statistics for Admin Dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            return Response({"error": "Admin access required"}, status=403)

        department = SUPERADMIN
        if hasattr(request.user, 'admin_profile'):
            department = request.user.admin_profile.department

        # Filtration context
        is_counsellor = request.user.role == COUNSELLOR
        
        # Base querysets
        jobs_qs = JobPost.objects.all()
        tutors_qs = TutorProfile.objects.all()
        kyc_qs = TutorKYC.objects.all()
        
        if is_counsellor:
            jobs_qs = jobs_qs.filter(assigned_admin=request.user)
            # We keep jobs_qs filtered by counsellor, but we show TOTAL tutors and parents 
            # so the dashboard feels active and they know the total pool they can work with.

        stats = {
            "total_tutors": TutorProfile.objects.count(),
            "total_parents": User.objects.filter(role='PARENT').count(),
            "active_jobs": jobs_qs.filter(status__in=['APPROVED', 'ACTIVE', 'ASSIGNED']).count(),
            "pending_jobs": jobs_qs.filter(status='PENDING_APPROVAL').count(),
            "pending_kyc": kyc_qs.filter(status='SUBMITTED').count(),
            "total_revenue": 0,
            "department": department,
        }
        return Response(stats)


class AdminPendingJobsView(generics.ListAPIView):
    """Admin views jobs assigned to them for approval."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            return JobPost.objects.none()
        
        # If it's a superadmin or admin, maybe they should see all pending jobs?
        # Or if the system strictly assigns jobs to specific admins:
        if self.request.user.role == SUPERADMIN:
            return JobPost.objects.filter(status='PENDING_APPROVAL').select_related('posted_by', 'assigned_admin').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user').order_by('-created_at')

        return JobPost.objects.filter(
            status='PENDING_APPROVAL',
            assigned_admin=self.request.user,
        ).select_related('posted_by', 'assigned_admin').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user').order_by('-created_at')

class AdminJobListView(generics.ListAPIView):
    """Admin views jobs strictly filtered by an optional status parameter."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in ADMIN_ROLES:
            return JobPost.objects.none()
            
        status_param = self.request.query_params.get('status')
        admin_id = self.request.query_params.get('admin_id')
        queryset = JobPost.objects.all().select_related('posted_by', 'assigned_admin').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user').order_by('-created_at')
        
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
            
        if admin_id:
            if admin_id == 'me':
                queryset = queryset.filter(assigned_admin=self.request.user)
            else:
                queryset = queryset.filter(assigned_admin_id=admin_id)

        return queryset


class AdminInstitutionJobListView(generics.ListAPIView):
    """List all pending jobs posted by Institutions for Admin approval."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            return JobPost.objects.none()
        return JobPost.objects.filter(
            status='PENDING_APPROVAL',
            posted_by__role='INSTITUTION',
        ).select_related('posted_by', 'assigned_admin').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user').order_by('-created_at')


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
        if request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            return Response({"error": "Admin access required"}, status=403)

        # Allow Superadmins to approve any job, but Admins/Counsellors only if assigned to them or if it's currently unassigned.
        if request.user.role == SUPERADMIN:
            job_post = get_object_or_404(JobPost, pk=pk)
        else:
            # You might want to allow counsellors to approve any pending job, not just those assigned.
            # Let's just fetch the job. If assignment is strict, add `assigned_admin=request.user`
            job_post = get_object_or_404(JobPost, pk=pk)
        if not job_post.assigned_admin:
            job_post.assigned_admin = request.user
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
        if request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            return Response({"error": "Admin access required"}, status=403)

        if request.user.role == SUPERADMIN:
            job_post = get_object_or_404(JobPost, pk=pk)
        else:
            job_post = get_object_or_404(JobPost, pk=pk)
        reason = request.data.get('reason', 'Does not meet platform guidelines')

        if not job_post.assigned_admin:
            job_post.assigned_admin = request.user
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
        if request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            return Response({"error": "Admin access required"}, status=403)

        if request.user.role == SUPERADMIN:
            job_post = get_object_or_404(JobPost, pk=pk)
        else:
            job_post = get_object_or_404(JobPost, pk=pk)
        feedback = request.data.get('feedback', 'Please review and update your job post')

        if not job_post.assigned_admin:
            job_post.assigned_admin = request.user
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


class AdminUpdateJobView(generics.UpdateAPIView):
    """Admin updates any field of a job post."""
    serializer_class = AdminJobUpdateSerializer
    queryset = JobPost.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
            self.permission_denied(request, message="Admin access required")

    def perform_update(self, serializer):
        job_post = self.get_object()
        # Automatically assign the job to the admin who is editing it if unassigned
        if not job_post.assigned_admin:
            serializer.save(assigned_admin=self.request.user)
        else:
            serializer.save()

class AdminAssignTutorView(APIView):
    """Admin manually assigns a tutor to a job."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in [TUTOR_ADMIN, SUPERADMIN, COUNSELLOR]:
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
        
        if demo_date:
            application.status = 'SHORTLISTED'
            application.demo_date = demo_date
            application.demo_status = 'PENDING'
            application.is_confirmed = False
        else:
            application.status = 'HIRED'
            application.is_confirmed = True
            
        application.save()

        job_post.status = 'ASSIGNED'
        # Automatically assign the job to the counsellor/admin who is assigning the tutor
        if request.user.role in [TUTOR_ADMIN, COUNSELLOR] and not job_post.assigned_admin:
            job_post.assigned_admin = request.user
        job_post.save()

        demo_msg = f" A demo has been scheduled for {demo_date}." if demo_date else ""

        send_notification(
            user=tutor_profile.user,
            title='Job Assigned' if not demo_date else 'Demo Scheduled',
            notification_type='SYSTEM',
            message=f"You have been manually assigned to the job: {job_post.class_grade} - {job_post.subjects}.{demo_msg}",
            related_job=job_post,
        )

        # Find the parent user - could be stored in either 'parent' or 'posted_by' field
        parent_user = job_post.parent or job_post.posted_by
        if parent_user and parent_user != tutor_profile.user:
            send_notification(
                user=parent_user,
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

class CounsellorClientsView(APIView):
    """List unique parents assigned to the counsellor."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ADMIN_ROLES:
            return Response({"error": "Admin access required"}, status=403)
        
        # Unique parents from JobPosts assigned to this admin
        job_parents = JobPost.objects.filter(assigned_admin=request.user).values_list('parent', flat=True).distinct()
        # Unique parents from enquiries assigned to this admin
        from users.models import Enquiry
        enquiry_parents = Enquiry.objects.filter(assigned_admin=request.user).values_list('email', flat=True).distinct()
        
        # Let's focus on JobPost parents (Users) for "My Clients"
        parent_ids = [pid for pid in job_parents if pid]
        parents = User.objects.filter(id__in=parent_ids)
        
        client_list = []
        for parent in parents:
            parent_jobs = JobPost.objects.filter(parent=parent, assigned_admin=request.user)
            client_list.append({
                "id": parent.id,
                "name": f"{parent.first_name} {parent.last_name}" if parent.first_name else parent.username,
                "email": parent.email,
                "phone": parent.phone,
                "total_jobs": parent_jobs.count(),
                "hired_tutors": Application.objects.filter(job__parent=parent, status='HIRED').count(),
                "last_active": parent_jobs.order_by('-updated_at').first().updated_at if parent_jobs.exists() else None
            })
            
        return Response(client_list)

class CounsellorClientHistoryView(APIView):
    """Full history for a specific client (parent)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, parent_id):
        if request.user.role not in ADMIN_ROLES:
            return Response({"error": "Admin access required"}, status=403)
            
        parent = get_object_or_404(User, id=parent_id)
        jobs = JobPost.objects.filter(parent=parent).order_by('-created_at')
        
        history = []
        for job in jobs:
            hired_application = job.applications.filter(status='HIRED').first()
            history.append({
                "id": job.id,
                "status": job.status,
                "subjects": job.subjects,
                "class_grade": job.class_grade,
                "locality": job.locality,
                "created_at": job.created_at,
                "hired_tutor": {
                    "id": hired_application.tutor.id,
                    "name": hired_application.tutor.full_name,
                    "phone": hired_application.tutor.user.phone
                } if hired_application else None
            })
            
        return Response({
            "parent_id": parent.id,
            "parent_name": f"{parent.first_name} {parent.last_name}" if parent.first_name else parent.username,
            "history": history
        })

class TransferLeadView(APIView):
    """Transfer a specific job (lead) to another admin."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ADMIN_ROLES:
            return Response({"error": "Admin access required"}, status=403)
            
        job = get_object_or_404(JobPost, pk=pk)
        new_admin_id = request.data.get('new_admin_id')
        
        if not new_admin_id:
            return Response({"error": "New admin ID is required"}, status=400)
            
        new_admin = get_object_or_404(User, id=new_admin_id)
        if new_admin.role not in ADMIN_ROLES:
            return Response({"error": "Target user is not an admin"}, status=400)
            
        job.assigned_admin = new_admin
        job.save()
        
        # Log or notify?
        return Response({"message": f"Job {pk} transferred to {new_admin.username}"})

class TransferClientView(APIView):
    """Transfer all data for a parent to another admin."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, parent_id):
        if request.user.role not in ADMIN_ROLES:
            return Response({"error": "Admin access required"}, status=403)
            
        parent = get_object_or_404(User, id=parent_id)
        new_admin_id = request.data.get('new_admin_id')
        
        if not new_admin_id:
            return Response({"error": "New admin ID is required"}, status=400)
            
        new_admin = get_object_or_404(User, id=new_admin_id)
        
        # Update all JobPosts
        jobs_updated = JobPost.objects.filter(parent=parent).update(assigned_admin=new_admin)
        
        # Update all Enquiries
        from users.models import Enquiry
        enquiries_updated = Enquiry.objects.filter(email=parent.email).update(assigned_admin=new_admin)
        
        return Response({
            "message": f"Client {parent.username} and related records transferred to {new_admin.username}",
            "jobs_updated": jobs_updated,
            "enquiries_updated": enquiries_updated
        })
