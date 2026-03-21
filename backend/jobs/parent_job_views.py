"""
Parent-facing job views: browse jobs, search, dashboard stats, institution viewset.
"""
import re
from datetime import timedelta

from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Case, When, Value, IntegerField, CharField
from django.db.models.functions import Cast

from .models import JobPost, Application, InstituteJob
from .serializers import JobPostSerializer, InstituteJobSerializer
from .utils import filter_by_subject, send_notification
from users.models import TutorProfile, User
from users.utils import get_tutor_image_url
from wallet.models import Wallet
from decimal import Decimal

import logging
logger = logging.getLogger(__name__)


def _deduct_teacher_rejection_credit(application):
    """Deduct 1 rejection credit from a teacher when explicitly rejected.
    
    Only called for EXPLICIT rejections by parent or admin,
    NOT for bulk rejections when another tutor is hired.
    """
    try:
        tutor_user = application.tutor.user
        wallet, _ = Wallet.objects.get_or_create(user=tutor_user)
        if wallet.balance >= Decimal('1'):
            wallet.debit(Decimal('1'), f'Rejection credit used: {application.job.class_grade}')
            logger.info(f'Deducted 1 rejection credit from {tutor_user.username}')
    except Exception as exc:
        logger.error(f'Error deducting rejection credit: {exc}')




class ParentJobListView(generics.ListAPIView):
    """List all approved jobs for parents to browse."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return JobPost.objects.filter(
            status='APPROVED'
        ).select_related('posted_by', 'assigned_admin').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user').order_by('-created_at')


class JobDetailView(generics.RetrieveAPIView):
    """Get details of a specific job."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return JobPost.objects.filter(
                Q(status='APPROVED') | Q(posted_by=user) | Q(parent=user)
            ).prefetch_related('applications', 'applications__tutor', 'applications__tutor__user')
        return JobPost.objects.filter(status='APPROVED').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user')


class JobSearchFilterView(generics.ListAPIView):
    """Advanced Job Search. Filters: subject, grade, location, budget_min."""
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = JobPost.objects.filter(
            status='APPROVED'
        ).select_related('posted_by', 'assigned_admin').prefetch_related('applications', 'applications__tutor', 'applications__tutor__user').order_by('-created_at')

        params = self.request.query_params

        queryset = queryset.annotate(subjects_str=Cast('subjects', CharField()))

        q = params.get('q')
        if q:
            queryset = queryset.filter(
                Q(subjects_str__icontains=q) |
                Q(class_grade__icontains=q) |
                Q(locality__icontains=q)
            )

        subject = params.get('subject')
        if subject:
            queryset = filter_by_subject(queryset, subject)


        grade = params.get('grade')
        if grade:
            # Handle common grade ranges
            grade_ranges = {
                'Class 1-5': ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
                'Class 6-8': ['Class 6', 'Class 7', 'Class 8'],
                'Class 9-10': ['Class 9', 'Class 10'],
                'Class 11-12': ['Class 11', 'Class 12'],
                # User's shorthand from UI labels
                '6-8': ['Class 6', 'Class 7', 'Class 8'],
                '1-5': ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
                '9-10': ['Class 9', 'Class 10'],
                '11-12': ['Class 11', 'Class 12'],
            }
            if grade in grade_ranges:
                queryset = queryset.filter(class_grade__in=grade_ranges[grade])
            else:
                queryset = queryset.filter(class_grade__icontains=grade)

        mode = params.get('mode')
        if mode:
            # Map common mode names to model choices if needed
            mode_map = {
                'Home': 'HOME',
                'Online': 'ONLINE_ONE_TO_ONE',
                'Institution': 'INSTITUTION',
            }
            db_mode = mode_map.get(mode, mode)
            queryset = queryset.filter(tuition_mode=db_mode)

        board = params.get('board')
        if board:
            queryset = queryset.filter(board__icontains=board)

        gender = params.get('gender')
        if gender:
            # gender can be 'Male', 'Female', or 'Any'
            # We filter for jobs that accept the tutor's gender or 'Any'
            queryset = queryset.filter(Q(tutor_gender_preference=gender) | Q(tutor_gender_preference='Any'))

        location = params.get('location')
        if location:
            queryset = queryset.filter(locality__icontains=location)

        min_budget = params.get('min_budget')
        if min_budget:
            # budget_min is not on JobPost, budget_range is. 
            # We'll stick to q or add more granular filtering if needed.
            pass

        return queryset


class ParentStatsView(APIView):
    """Get enhanced dashboard stats for parent including activity feed."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.PARENT:
            return Response({"error": "Only parents can view stats"}, status=403)

        user = request.user
        now = timezone.now()

        stats = self._get_job_stats(user)
        wallet_balance = self._get_wallet_balance(user)
        assigned_tutor = self._get_assigned_tutor(user)
        recommended_tutors = self._get_recommended_tutors(user)
        activities = self._build_activity_feed(user)
        recent_jobs_data = JobPostSerializer(
            JobPost.objects.filter(Q(posted_by=user) | Q(parent=user)).order_by('-created_at')[:3],
            many=True,
        ).data

        return Response({
            "stats": {
                "active_jobs": stats['active_jobs'],
                "applications_received": stats['applications_received'],
                "hired_count": stats['hired_count'],
                "wallet_balance": wallet_balance,
            },
            "assigned_tutor": assigned_tutor,
            "recommended_tutors": recommended_tutors,
            "recent_activities": activities,
            "recent_jobs": recent_jobs_data,
        })

    def _get_job_stats(self, user):
        """Compute core job statistics."""
        active_jobs = JobPost.objects.filter(
            Q(posted_by=user) | Q(parent=user),
            status__in=['APPROVED', 'PENDING_APPROVAL', 'ASSIGNED'],
        ).count()
        applications_received = Application.objects.filter(Q(job__posted_by=user) | Q(job__parent=user)).count()
        hired_count = JobPost.objects.filter(
            Q(posted_by=user) | Q(parent=user),
            status='ASSIGNED'
        ).count()
        return {'active_jobs': active_jobs, 'applications_received': applications_received, 'hired_count': hired_count}

    def _get_wallet_balance(self, user):
        """Get users wallet balance safely."""
        try:
            if hasattr(user, 'wallet'):
                return user.wallet.balance
        except Exception:
            pass
        return 0.00

    def _get_assigned_tutor(self, user):
        """Get the most recently hired tutor info."""
        hire = Application.objects.filter(
            Q(job__posted_by=user) | Q(job__parent=user), status='HIRED'
        ).select_related('tutor__user', 'job').order_by('-updated_at').first()

        if hire and hire.tutor:
            return {
                "name": hire.tutor.full_name or hire.tutor.user.first_name,
                "subject": hire.job.subjects[0] if hire.job.subjects else "General",
                "image": get_tutor_image_url(hire.tutor),
            }
        return None

    def _get_recommended_tutors(self, user, limit=5):
        """Recommend active tutors, prioritizing locality match."""
        last_job = JobPost.objects.filter(Q(posted_by=user) | Q(parent=user)).order_by('-created_at').first()
        parent_locality = last_job.locality if last_job else None

        qs = TutorProfile.objects.filter(
            status_record__status='ACTIVE'
        ).select_related('user')

        if parent_locality:
            qs = qs.annotate(
                locality_match=Case(
                    When(locality__icontains=parent_locality, then=Value(2)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ).order_by('-locality_match', '-teaching_experience_years')
        else:
            qs = qs.order_by('-teaching_experience_years')

        return [
            {
                "id": t.id,
                "name": t.full_name or t.user.first_name,
                "subjects": t.subjects,
                "locality": t.locality,
                "rating": 4.8,
                "image": get_tutor_image_url(t),
                "experience": t.teaching_experience_years,
            }
            for t in qs[:limit]
        ]

    def _build_activity_feed(self, user, limit=5):
        """Combine recent jobs, applications, wallet txns into a sorted feed."""
        activities = []

        # Recent jobs status updates
        for job in JobPost.objects.filter(Q(posted_by=user) | Q(parent=user)).order_by('-created_at')[:3]:
            if job.status == 'PENDING_APPROVAL':
                activities.append({
                    "type": "info", "title": "Job Under Review",
                    "description": f"Your request for {job.class_grade} is being reviewed.",
                    "timestamp": job.created_at.isoformat(), "icon": "clock",
                })
            elif job.status == 'APPROVED':
                activities.append({
                    "type": "success", "title": "Job Approved",
                    "description": f"Your request for {job.class_grade} is approved. Awaiting tutors.",
                    "timestamp": job.updated_at.isoformat(), "icon": "check-circle",
                })
            elif job.status == 'OPEN':
                activities.append({
                    "type": "success", "title": "Job Live",
                    "description": f"Your request for {job.class_grade} is now Live.",
                    "timestamp": job.updated_at.isoformat(), "icon": "check-circle",
                })
            elif job.status == 'ASSIGNED':
                activities.append({
                    "type": "success", "title": "Tutor Assigned",
                    "description": f"Your request for {job.class_grade} has a tutor assigned.",
                    "timestamp": job.updated_at.isoformat(), "icon": "user-check",
                })

        # Recent applications
        for app in Application.objects.filter(
            Q(job__posted_by=user) | Q(job__parent=user)
        ).select_related('tutor__user', 'job').order_by('-created_at')[:3]:
            activities.append({
                "type": "application", "title": "New Applicant",
                "description": f"{app.tutor.full_name or 'A tutor'} applied for {app.job.class_grade}.",
                "timestamp": app.created_at.isoformat(), "icon": "user-plus",
            })

        # Wallet transactions
        try:
            if hasattr(user, 'wallet'):
                from wallet.models import Transaction
                for tx in Transaction.objects.filter(wallet=user.wallet).order_by('-created_at')[:3]:
                    verb = 'Debited' if tx.transaction_type == 'DEBIT' else 'Credited'
                    activities.append({
                        "type": "wallet", "title": "Wallet Update",
                        "description": f"{verb} ₹{tx.amount}",
                        "timestamp": tx.created_at.isoformat(), "icon": "credit-card",
                    })
        except Exception:
            pass

        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return activities[:limit]


class InstituteJobViewSet(viewsets.ModelViewSet):
    """CRUD for Institute Jobs. Institutions can create/update their own jobs."""
    serializer_class = InstituteJobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = InstituteJob.objects.all().order_by('-created_at')

        if self.action in ['list', 'retrieve']:
            mode = self.request.query_params.get('mode')
            if (mode == 'my_jobs'
                    and self.request.user.is_authenticated
                    and self.request.user.role == User.Role.INSTITUTION):
                return queryset.filter(institution=self.request.user)
            return queryset.filter(status='OPEN')

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.INSTITUTION:
            raise permissions.PermissionDenied("Only Institutions can post jobs.")
        serializer.save(institution=self.request.user)

    def perform_update(self, serializer):
        if self.request.user != serializer.instance.institution:
            raise permissions.PermissionDenied("You can only edit your own jobs.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.institution:
            raise permissions.PermissionDenied("You can only delete your own jobs.")
        instance.delete()

from django.shortcuts import get_object_or_404

class ParentApplicationActionView(APIView):
    """Parent accepts or rejects a tutor's application."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'PARENT':
            return Response({"error": "Only parents can perform this action"}, status=status.HTTP_403_FORBIDDEN)
            
        application = get_object_or_404(Application, pk=pk)
        job = application.job
        
        # Ensure the user owns the job
        if job.posted_by != request.user and job.parent != request.user:
            return Response({"error": "You do not have permission for this job"}, status=status.HTTP_403_FORBIDDEN)
            
        action = request.data.get('action') # 'ACCEPT' or 'REJECT'
        
        if action == 'ACCEPT':
            application.status = 'HIRED'
            application.is_confirmed = True
            application.save()
            job.status = 'ASSIGNED'
            job.save()
            # Reject all other applications for this job
            Application.objects.filter(job=job).exclude(pk=pk).update(status='REJECTED')
            return Response({"message": "Application accepted successfully!"})
            
        elif action == 'REJECT':
            application.status = 'REJECTED'
            application.save()
            _deduct_teacher_rejection_credit(application)
            return Response({"message": "Application rejected."})
            
        return Response({"error": "Invalid action, must be ACCEPT or REJECT"}, status=status.HTTP_400_BAD_REQUEST)

from .models import TutorRating, TutorAttendance
from .serializers import TutorRatingSerializer, TutorAttendanceSerializer

class TutorRatingView(generics.CreateAPIView):
    """Parent rates a tutor"""
    serializer_class = TutorRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.PARENT:
            raise permissions.PermissionDenied("Only parents can rate tutors")
        serializer.save(parent=self.request.user)

class TutorAttendanceView(generics.ListCreateAPIView):
    """Parent marks/views attendance for their assigned tutor"""
    serializer_class = TutorAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TutorAttendance.objects.filter(marked_by=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.PARENT:
            raise permissions.PermissionDenied("Only parents can mark attendance")
        serializer.save(marked_by=self.request.user)


class ParentCloseJobView(APIView):
    """Parent closes an active job posting."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != User.Role.PARENT:
            return Response({"error": "Only parents can perform this action"}, status=status.HTTP_403_FORBIDDEN)
            
        job = get_object_or_404(JobPost, pk=pk)
        
        # Ensure the user owns the job
        if job.posted_by != request.user and job.parent != request.user:
            return Response({"error": "You do not have permission to close this job."}, status=status.HTTP_403_FORBIDDEN)
            
        if job.status == 'CLOSED':
            return Response({"message": "Job is already closed."}, status=status.HTTP_200_OK)
            
        job.status = 'CLOSED'
        job.save()
        
        return Response({"message": "Job successfully closed.", "status": job.status}, status=status.HTTP_200_OK)

class ParentDemoActionView(APIView):
    """Parent accepts, rejects, requests reschedule, or completes a demo."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != User.Role.PARENT:
            return Response({"error": "Only parents can perform this action"}, status=status.HTTP_403_FORBIDDEN)
            
        action = request.data.get('action', '').upper()
        remarks = request.data.get('remarks', '')
        
        application = get_object_or_404(Application, pk=pk)
        job = application.job
        
        if job.posted_by != request.user and job.parent != request.user:
            return Response({"error": "You do not have permission for this job."}, status=status.HTTP_403_FORBIDDEN)
            
        notification_title = ""
        notification_msg = ""
            
        if action == 'ACCEPT':
            application.demo_status = 'ACCEPTED'
            notification_title = 'Demo Accepted'
            notification_msg = f"Parent has accepted the demo for {job.class_grade} ({job.subjects})."
        elif action == 'REJECT':
            application.demo_status = 'REJECTED'
            application.demo_remarks = remarks
            notification_title = 'Demo Rejected'
            notification_msg = f"Parent has rejected the demo for {job.class_grade}. Reason: {remarks}"
        elif action == 'RESCHEDULE':
            application.demo_status = 'RESCHEDULE_REQUESTED'
            application.demo_remarks = remarks
            notification_title = 'Demo Reschedule Requested'
            notification_msg = f"Parent requested to reschedule the demo for {job.class_grade}. Remarks: {remarks}"
        elif action in ['COMPLETE', 'COMPLETED']:
            application.demo_status = 'COMPLETED'
            notification_title = 'Demo Completed'
            notification_msg = f"Parent has marked the demo for {job.class_grade} as completed."
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
        application.save()
        
        # Notify the tutor
        if notification_title and application.tutor and application.tutor.user:
            send_notification(
                user=application.tutor.user,
                title=notification_title,
                message=notification_msg,
                notification_type='SYSTEM',
                related_job=job
            )
            
            
        application.save()
        return Response({
            "message": f"Demo marked as {application.demo_status}", 
            "demo_status": application.demo_status
        }, status=status.HTTP_200_OK)

class ParentConfirmTutorView(APIView):
    """Parent confirms the tutor after a successful completed demo."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != User.Role.PARENT:
            return Response({"error": "Only parents can perform this action"}, status=status.HTTP_403_FORBIDDEN)
            
        application = get_object_or_404(Application, pk=pk)
        job = application.job
        
        if job.posted_by != request.user and job.parent != request.user:
            return Response({"error": "You do not have permission for this job."}, status=status.HTTP_403_FORBIDDEN)
            
        if application.demo_status != 'COMPLETED':
            return Response({"error": "Demo must be marked as COMPLETED before confirming the tutor."}, status=status.HTTP_400_BAD_REQUEST)
            
        application.status = 'HIRED'
        application.is_confirmed = True
        application.save()

        # Update Job status and reject other applications
        job.status = 'ASSIGNED'
        job.save()
        Application.objects.filter(job=job).exclude(pk=pk).update(status='REJECTED')
        
        # Notify tutor they are hired
        if application.tutor and application.tutor.user:
            send_notification(
                user=application.tutor.user,
                title='You have been Hired!',
                message=f"Parent has confirmed you as the tutor for {job.class_grade} ({job.subjects}).",
                notification_type='SYSTEM',
                related_job=job
            )
        
        return Response({
            "message": "Tutor successfully confirmed for this job.", 
            "status": application.status,
            "is_confirmed": application.is_confirmed,
            "job_status": job.status
        }, status=status.HTTP_200_OK)
