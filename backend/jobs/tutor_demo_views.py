"""
Tutor-facing demo views: mark demo as completed.
"""
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Application
from .utils import send_notification
from users.models import TutorProfile

import logging
logger = logging.getLogger(__name__)


class TutorMarkDemoCompletedView(APIView):
    """Tutor marks a scheduled demo as completed."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can perform this action"}, status=status.HTTP_403_FORBIDDEN)

        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor profile not found"}, status=status.HTTP_404_NOT_FOUND)

        application = get_object_or_404(Application, pk=pk, tutor=tutor_profile)

        if not application.demo_date:
            return Response({"error": "No demo is scheduled for this application."}, status=status.HTTP_400_BAD_REQUEST)

        if application.demo_status == 'COMPLETED':
            return Response({"error": "Demo is already marked as completed."}, status=status.HTTP_400_BAD_REQUEST)

        application.demo_status = 'COMPLETED'
        application.demo_completed_at = timezone.now()
        application.save()

        # Notify the tutor that it's recorded
        logger.info(f"Tutor {request.user.username} marked demo {pk} as completed.")

        # Notify the parent immediately that the tutor has completed the demo
        job = application.job
        parent_user = job.parent or job.posted_by
        if parent_user:
            send_notification(
                user=parent_user,
                title='Demo Completed',
                message=f"Tutor {tutor_profile.full_name} has completed the demo for {job.class_grade} ({job.subjects}). We will follow up shortly for your feedback.",
                notification_type='SYSTEM',
                related_job=job,
            )

        return Response({
            "message": "Demo marked as completed successfully. The parent will be notified for feedback.",
            "demo_status": application.demo_status,
        }, status=status.HTTP_200_OK)


class TutorScheduledDemosView(APIView):
    """Get all scheduled demos for the logged-in tutor."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'TEACHER':
            return Response({"error": "Only tutors can view demos"}, status=status.HTTP_403_FORBIDDEN)

        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor profile not found"}, status=status.HTTP_404_NOT_FOUND)

        from .serializers import ApplicationSerializer

        demos = Application.objects.filter(
            tutor=tutor_profile,
            demo_date__isnull=False,
        ).exclude(
            is_confirmed=True
        ).exclude(
            demo_status='REJECTED'
        ).select_related('job', 'tutor').order_by('-demo_date')

        serializer = ApplicationSerializer(demos, many=True)
        return Response({
            'demos': serializer.data,
            'count': demos.count(),
        })
