"""
Tutor-facing job views: create jobs, apply, view applications.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import JobPost, Application
from .serializers import JobPostSerializer, TutorJobPostSerializer, ApplicationSerializer
from .utils import assign_job_to_admin, send_notification
from users.models import TutorProfile

import logging

logger = logging.getLogger(__name__)


class TutorJobCreateView(APIView):
    """Tutor creates a job opportunity post."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can post job opportunities"}, status=403)

        serializer = TutorJobPostSerializer(data=request.data)
        if serializer.is_valid():
            try:
                job_post = serializer.save(posted_by=request.user, status='PENDING_APPROVAL')
                assigned_admin = assign_job_to_admin(job_post)
                logger.info(f"Job {job_post.id} created by tutor {request.user.username}, assigned to {assigned_admin.username}")
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


class JobCreateView(APIView):
    """Allow Parents, Tutors, and Institutions to create a job opportunity post."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        allowed_roles = ['PARENT', 'TEACHER', 'ADMIN', 'SUPERADMIN', 'INSTITUTION']
        if request.user.role not in allowed_roles:
            return Response({"error": "You must be logged in as a Parent, Tutor, or Institution to post a job."}, status=403)

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
        return JobPost.objects.filter(
            posted_by=self.request.user
        ).select_related('posted_by', 'assigned_admin').order_by('-created_at')


class TutorApplicationsView(APIView):
    """Get all applications submitted by the tutor."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'TEACHER':
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
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can apply for jobs"}, status=403)

        job = get_object_or_404(JobPost, pk=pk)
        if job.status != 'APPROVED':
            return Response({"error": "Job is not accepting applications"}, status=400)

        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({"error": "Complete your tutor profile first"}, status=400)

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
        if job.posted_by != self.request.user:
            return Application.objects.none()
        return Application.objects.filter(
            job=job
        ).select_related('tutor__user').order_by('-created_at')
