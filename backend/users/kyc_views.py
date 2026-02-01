"""
KYC-related API views
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import TutorProfile, TutorKYC, TutorStatus
from .serializers import TutorKYCSerializer
from jobs.utils import assign_kyc_to_admin, send_notification
from jobs.admin_models import AdminTask


class KYCDocumentUploadView(APIView):
    """
    Upload KYC documents
    Tutors can upload required and optional documents
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check if user is a tutor
        if request.user.role != 'TEACHER':
            return Response(
                {"error": "Only tutors can upload KYC documents"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get tutor profile
        try:
            profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response(
                {"error": "Tutor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if profile is complete (optional, can be enforced)
        # if profile.profile_completion_percentage < 100:
        #     return Response(
        #         {"error": "Please complete your profile before submitting KYC"},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        # Get or create KYC record
        kyc_record = TutorKYC.objects.filter(tutor=profile).order_by('-created_at').first()
        
        # Check submission count (max 3 attempts)
        if kyc_record and kyc_record.submission_count >= 3:
            return Response(
                {"error": "Maximum KYC submission attempts (3) exceeded. Please contact support."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create new KYC record or update existing draft
        if not kyc_record or kyc_record.status in [TutorKYC.Status.VERIFIED, TutorKYC.Status.REJECTED]:
            # Create new record
            serializer = TutorKYCSerializer(data=request.data)
            if serializer.is_valid():
                kyc_instance = serializer.save(
                    tutor=profile,
                    status=TutorKYC.Status.SUBMITTED,
                    submission_count=(kyc_record.submission_count + 1) if kyc_record else 1
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Update existing draft
            serializer = TutorKYCSerializer(kyc_record, data=request.data, partial=True)
            if serializer.is_valid():
                kyc_instance = serializer.save(
                    status=TutorKYC.Status.SUBMITTED,
                    submission_count=kyc_record.submission_count + 1
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update tutor status
        tutor_status, _ = TutorStatus.objects.get_or_create(tutor=profile)
        tutor_status.status = TutorStatus.State.KYC_SUBMITTED
        tutor_status.save()
        
        # Auto-assign to admin
        try:
            assigned_admin = assign_kyc_to_admin(kyc_instance)
            
            # Send notification to tutor
            send_notification(
                user=request.user,
                title="KYC Submitted Successfully",
                message="Your KYC documents have been submitted and are under review. You'll be notified once verified.",
                notification_type='SYSTEM',
                related_kyc=kyc_instance
            )
            
            return Response({
                "message": "KYC documents submitted successfully",
                "status": kyc_instance.status,
                "assigned_admin": assigned_admin.username
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to assign admin: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class KYCStatusView(APIView):
    """
    Get current KYC status for logged-in tutor
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'TEACHER':
            return Response(
                {"error": "Only tutors can check KYC status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = TutorProfile.objects.get(user=request.user)
            kyc_record = TutorKYC.objects.filter(tutor=profile).order_by('-created_at').first()
            tutor_status = TutorStatus.objects.get(tutor=profile)
            
            if not kyc_record:
                return Response({
                    "status": "NOT_SUBMITTED",
                    "message": "No KYC documents submitted yet",
                    "tutor_status": tutor_status.status
                })
            
            serializer = TutorKYCSerializer(kyc_record)
            return Response({
                "kyc": serializer.data,
                "tutor_status": tutor_status.status,
                "documents_to_resubmit": kyc_record.documents_to_resubmit,
                "admin_feedback": kyc_record.admin_feedback,
                "rejection_reason": kyc_record.rejection_reason
            })
            
        except TutorProfile.DoesNotExist:
            return Response(
                {"error": "Tutor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except TutorStatus.DoesNotExist:
            return Response(
                {"error": "Tutor status not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminPendingKYCView(generics.ListAPIView):
    """
    List KYC verifications assigned to the logged-in admin
    """
    serializer_class = TutorKYCSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check if user is admin
        if self.request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return TutorKYC.objects.none()
        
        # Return KYC records assigned to this admin with UNDER_REVIEW status
        return TutorKYC.objects.filter(
            assigned_admin=self.request.user,
            status=TutorKYC.Status.UNDER_REVIEW
        ).select_related('tutor__user', 'assigned_admin').order_by('-assigned_at')


class AdminKYCVerifyView(APIView):
    """
    Admin can approve, reject, or request re-submission for KYC
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        # Check if user is admin
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response(
                {"error": "Only admins can verify KYC"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get KYC record
        kyc_record = get_object_or_404(TutorKYC, pk=pk)
        
        # Check if assigned to this admin (superadmin can verify any)
        if request.user.role == 'ADMIN' and kyc_record.assigned_admin != request.user:
            return Response(
                {"error": "This KYC is not assigned to you"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get('action')  # 'approve', 'reject', 'resubmit'
        
        if action == 'approve':
            # Mark all documents as verified
            kyc_record.aadhaar_verified = True
            kyc_record.education_verified = True
            kyc_record.photo_verified = True
            if kyc_record.pan_document:
                kyc_record.pan_verified = True
            
            # Update KYC status
            kyc_record.status = TutorKYC.Status.VERIFIED
            kyc_record.reviewed_at = timezone.now()
            kyc_record.save()
            
            # Update tutor status
            tutor_status = TutorStatus.objects.get(tutor=kyc_record.tutor)
            tutor_status.status = TutorStatus.State.APPROVED
            tutor_status.save()
            
            # Mark admin task as completed
            AdminTask.objects.filter(
                related_kyc=kyc_record,
                admin=request.user,
                status='PENDING'
            ).update(status='COMPLETED', completed_at=timezone.now())
            
            # Send notification to tutor
            send_notification(
                user=kyc_record.tutor.user,
                title="KYC Approved!",
                message="Congratulations! Your KYC has been verified. You can now post job opportunities and appear in parent searches.",
                notification_type='KYC_APPROVED',
                related_kyc=kyc_record
            )
            
            return Response({
                "message": "KYC approved successfully",
                "status": "VERIFIED"
            })
        
        elif action == 'reject':
            rejection_reason = request.data.get('reason', '')
            if not rejection_reason:
                return Response(
                    {"error": "Rejection reason is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update KYC status
            kyc_record.status = TutorKYC.Status.REJECTED
            kyc_record.rejection_reason = rejection_reason
            kyc_record.reviewed_at = timezone.now()
            kyc_record.save()
            
            # Update tutor status
            tutor_status = TutorStatus.objects.get(tutor=kyc_record.tutor)
            tutor_status.status = TutorStatus.State.REJECTED
            tutor_status.save()
            
            # Mark admin task as completed
            AdminTask.objects.filter(
                related_kyc=kyc_record,
                admin=request.user,
                status='PENDING'
            ).update(status='COMPLETED', completed_at=timezone.now())
            
            # Send notification to tutor
            send_notification(
                user=kyc_record.tutor.user,
                title="KYC Rejected",
                message=f"Your KYC has been rejected. Reason: {rejection_reason}",
                notification_type='KYC_REJECTED',
                related_kyc=kyc_record
            )
            
            return Response({
                "message": "KYC rejected",
                "reason": rejection_reason
            })
        
        elif action == 'resubmit':
            documents_to_resubmit = request.data.get('documents', [])
            admin_feedback = request.data.get('feedback', '')
            
            if not documents_to_resubmit or not admin_feedback:
                return Response(
                    {"error": "Documents list and feedback are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update KYC record
            kyc_record.status = TutorKYC.Status.DRAFT
            kyc_record.documents_to_resubmit = documents_to_resubmit
            kyc_record.admin_feedback = admin_feedback
            kyc_record.reviewed_at = timezone.now()
            kyc_record.save()
            
            # Update tutor status
            tutor_status = TutorStatus.objects.get(tutor=kyc_record.tutor)
            tutor_status.status = TutorStatus.State.PROFILE_INCOMPLETE
            tutor_status.save()
            
            # Mark admin task as completed
            AdminTask.objects.filter(
                related_kyc=kyc_record,
                admin=request.user,
                status='PENDING'
            ).update(status='COMPLETED', completed_at=timezone.now())
            
            # Send notification to tutor
            send_notification(
                user=kyc_record.tutor.user,
                title="KYC Re-submission Required",
                message=f"Please re-upload the following documents: {', '.join(documents_to_resubmit)}. Feedback: {admin_feedback}",
                notification_type='KYC_RESUBMIT',
                related_kyc=kyc_record
            )
            
            return Response({
                "message": "Re-submission requested",
                "documents": documents_to_resubmit,
                "feedback": admin_feedback
            })
        
        else:
            return Response(
                {"error": "Invalid action. Use 'approve', 'reject', or 'resubmit'"},
                status=status.HTTP_400_BAD_REQUEST
            )
