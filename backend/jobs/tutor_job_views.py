"""
Tutor-facing job views: create jobs, apply, view applications.
"""
from decimal import Decimal

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import JobPost, Application
from core.roles import ADMIN_ROLES, COUNSELLOR, SUPERADMIN, TUTOR_ADMIN
from .serializers import JobPostSerializer, TutorJobPostSerializer, ApplicationSerializer
from .utils import assign_job_to_admin, send_notification
from users.models import TutorProfile, User
from wallet.models import Wallet

import logging

logger = logging.getLogger(__name__)




class JobCreateView(APIView):
    """Allow Parents, Tutors, and Institutions to create a job opportunity post."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        allowed_roles = [
            User.Role.PARENT, User.Role.TEACHER, User.Role.COUNSELLOR, 
            User.Role.TUTOR_ADMIN, User.Role.SUPERADMIN, User.Role.INSTITUTION
        ]
        if request.user.role not in allowed_roles:
            return Response({"error": "You do not have permission to post a job."}, status=403)

        serializer = TutorJobPostSerializer(data=request.data)
        if serializer.is_valid():
            try:
                job_post = serializer.save(posted_by=request.user, status='PENDING_APPROVAL')
                assigned_admin = assign_job_to_admin(job_post)
                logger.info(f"Job {job_post.id} created by {request.user.role} {request.user.username}, assigned to {assigned_admin.username}")
                return Response({
                    "message": "Job posted successfully! It's being reviewed by our team.",
                    "job_id": job_post.id,
                    "status": job_post.status,
                    "assigned_to": assigned_admin.username,
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error creating job post: {e}")
                if 'job_post' in locals():
                    job_post.delete()
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyJobPostsView(generics.ListAPIView):
    """List current user's own job posts."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q
        return JobPost.objects.filter(
            Q(posted_by=self.request.user) | Q(parent=self.request.user)
        ).select_related('posted_by', 'parent', 'assigned_admin').order_by('-created_at')


class TutorApplicationsView(APIView):
    """Get all applications submitted by the tutor."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.TEACHER:
            return Response({"error": "Only tutors can view applications"}, status=403)

        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
            applications = Application.objects.filter(
                tutor=tutor_profile
            ).select_related('job').order_by('-created_at')

            status_filter = request.query_params.get('status')
            if status_filter:
                applications = applications.filter(status=status_filter.upper())

            serializer = ApplicationSerializer(applications, many=True)
            stats = {
                'total': applications.count(),
                'applied': applications.filter(status='APPLIED').count(),
                'shortlisted': applications.filter(status='SHORTLISTED').count(),
                'hired': applications.filter(status='HIRED').count(),
                'rejected': applications.filter(status='REJECTED').count(),
            }
            return Response({'applications': serializer.data, 'stats': stats})

        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor profile not found"}, status=404)
        except Exception as e:
            logger.error(f"Error fetching applications: {e}")
            return Response({"error": str(e)}, status=500)


class JobApplicationCreateView(APIView):
    """Tutor applies for a job."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != User.Role.TEACHER:
            return Response({"error": "Only tutors can apply for jobs"}, status=403)

        job = get_object_or_404(JobPost, pk=pk)
        if job.status != 'APPROVED':
            return Response({"error": "Job is not accepting applications"}, status=400)

        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({"error": "Complete your tutor profile first"}, status=400)

        # Block applying if tutor has an active hired job with pending payment
        active_hired = Application.objects.filter(
            tutor=tutor_profile,
            status='HIRED',
            job_completion_status='ONGOING',
        ).exclude(payment_status='PAID')

        if active_hired.exists():
            active_job = active_hired.first()
            return Response({
                "error": "You currently have an active tuition assignment. You can apply for new jobs only after your current tuition is completed and payment is received.",
                "active_job_id": active_job.job.id,
                "active_job_class": active_job.job.class_grade,
                "active_job_subjects": active_job.job.subjects,
                "payment_status": active_job.payment_status,
            }, status=400)

        # Block applying if teacher has 0 credits
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        if wallet.balance < Decimal('1'):
            return Response({
                "error": "You have 0 rejection credits. Purchase credits to apply for jobs.",
                "credits": float(wallet.balance),
            }, status=402)

        if Application.objects.filter(job=job, tutor=tutor_profile).exists():
            return Response({"error": "You have already applied for this job"}, status=400)

        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(job=job, tutor=tutor_profile)
            if job.posted_by:
                send_notification(
                    user=job.posted_by,
                    title="New Tutor Application",
                    message=f"{tutor_profile.full_name} has applied for your {job.class_grade} job!",
                    notification_type='SYSTEM',
                    related_job=job,
                )
            return Response({"message": "Application submitted successfully!"}, status=201)
        return Response(serializer.errors, status=400)


class JobApplicantsView(generics.ListAPIView):
    """Parent views applicants for a specific job."""
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job = get_object_or_404(JobPost, pk=self.kwargs['pk'])
        user = self.request.user
        
        # Check permissions: Poster, assigned parent, or Admin/Counsellor
        is_owner = (job.posted_by == user or job.parent == user)
        is_admin = (user.role in ADMIN_ROLES)
        
        if not (is_owner or is_admin):
            return Application.objects.none()
            
        return Application.objects.filter(
            job=job
        ).select_related('tutor__user').order_by('-created_at')
