"""
Authentication and core user views.
Handles: login, signup, OTP, Google login, and user profile retrieval.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.cache import cache

from .serializers import (
    UserSerializer, TutorProfileSerializer,
    CustomTokenObtainPairSerializer, TutorKYCSerializer,
)
from .models import TutorProfile, TutorKYC, TutorStatus, InstitutionProfile
from .utils import generate_otp, send_otp_to_phone, verify_google_token

import sys
import uuid
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


# ==================== AUTH VIEWS ====================

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "User created successfully",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
        }, status=status.HTTP_201_CREATED)


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        otp = generate_otp()
        cache.set(f"otp_{phone}", otp, timeout=300)
        send_otp_to_phone(phone, otp)
        return Response({"message": "OTP sent successfully"})


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        role = request.data.get('role', 'PARENT')

        if not phone or not otp:
            return Response({"error": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_{phone}")
        if not cached_otp or cached_otp != otp:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            username = f"user_{phone}"
            user = User.objects.create_user(username=username, phone=phone, role=role)
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
        })


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import traceback
        try:
            token = request.data.get('token')
            role = request.data.get('role', 'PARENT')

            logger.info(f"GoogleLoginView: token={'yes' if token else 'no'}, role={role}")

            if not token:
                return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

            google_data = verify_google_token(token)
            logger.info(f"GoogleLoginView: google_data keys={list(google_data.keys()) if google_data else 'None'}")

            if not google_data:
                return Response({"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST)

            if 'error' in google_data:
                logger.error(f"GoogleLoginView: Google returned error: {google_data['error']}")
                return Response({"error": google_data['error']}, status=status.HTTP_400_BAD_REQUEST)

            email = google_data.get('email')
            if not email:
                logger.error(f"GoogleLoginView: No email. Full response: {google_data}")
                return Response({"error": "Could not retrieve email from Google."}, status=status.HTTP_400_BAD_REQUEST)

            name = google_data.get('name') or google_data.get('given_name') or email.split('@')[0]
            logger.info(f"GoogleLoginView: email={email}, name={name}")

            try:
                user = User.objects.get(email=email)
                logger.info(f"GoogleLoginView: Found existing user {user.id}")
            except User.DoesNotExist:
                if not request.data.get('role'):
                    return Response({
                        "status": "role_required",
                        "email": email,
                        "name": name,
                        "message": "User not found. Please select a role.",
                    }, status=status.HTTP_200_OK)

                base_username = email.split('@')[0]
                unique_username = f"{base_username}_{uuid.uuid4().hex[:6]}"
                user = User.objects.create_user(
                    username=unique_username,
                    email=email,
                    first_name=name or email.split('@')[0],
                    role=role,
                )
                user.set_unusable_password()
                user.save()
                logger.info(f"GoogleLoginView: Created new user {user.id} with role {role}")

                # Create associated profiles
                if role == 'TEACHER':
                    if not hasattr(user, 'tutor_profile'):
                        TutorProfile.objects.create(user=user)
                        TutorStatus.objects.create(tutor=user.tutor_profile)
                        logger.info(f"GoogleLoginView: Created TutorProfile & Status for {user.id}")
                elif role == 'INSTITUTION':
                    if not hasattr(user, 'institution_profile'):
                        InstitutionProfile.objects.create(
                            user=user,
                            institution_name=name or "New Institution",
                            contact_person=name or "",
                        )
                        logger.info(f"GoogleLoginView: Created InstitutionProfile for {user.id}")

            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
            })
        except Exception as e:
            tb = traceback.format_exc()
            print(f"GoogleLoginView UNHANDLED ERROR: {tb}", file=sys.stderr)
            logger.critical(f"GoogleLoginView UNHANDLED ERROR: {tb}")
            return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ==================== ADMIN VIEWS (kept here for backward compat) ====================

class KYCSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'TEACHER':
            return Response({"error": "Only tutors can submit KYC."}, status=status.HTTP_403_FORBIDDEN)

        profile = user.tutor_profile

        if profile.profile_completion_percentage < 100:
            return Response({
                "error": "Profile must be 100% complete before KYC submission.",
                "current_percentage": profile.profile_completion_percentage,
            }, status=status.HTTP_400_BAD_REQUEST)

        kyc_record = TutorKYC.objects.filter(tutor=profile).order_by('-created_at').first()
        submission_count = kyc_record.submission_count if kyc_record else 0

        if submission_count >= 3:
            return Response({"error": "Maximum KYC attempts (3) exceeded. Contact support."}, status=status.HTTP_403_FORBIDDEN)

        serializer = TutorKYCSerializer(data=request.data)
        if serializer.is_valid():
            kyc_instance = serializer.save(
                tutor=profile,
                status=TutorKYC.Status.SUBMITTED,
                submission_count=submission_count + 1,
            )

            status_obj, _ = TutorStatus.objects.get_or_create(tutor=profile)
            status_obj.status = TutorStatus.State.KYC_SUBMITTED
            status_obj.save()
            status_obj.status = TutorStatus.State.UNDER_REVIEW
            status_obj.save()

            return Response({
                "message": "KYC Submitted successfully.",
                "status": status_obj.status,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminTutorListView(generics.ListAPIView):
    """Retrieve all tutors for admin dashboard with filtering."""
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        from django.db.models import Q

        queryset = TutorProfile.objects.all().select_related(
            'user', 'status_record'
        ).order_by('-user__date_joined')

        status_param = self.request.query_params.get('status')
        if status_param:
            if status_param == 'PENDING':
                queryset = queryset.filter(status_record__status__in=[
                    TutorStatus.State.KYC_SUBMITTED,
                    TutorStatus.State.UNDER_REVIEW,
                    TutorStatus.State.SIGNED_UP,
                ])
            else:
                queryset = queryset.filter(status_record__status=status_param)

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q) |
                Q(user__email__icontains=q) |
                Q(user__phone__icontains=q) |
                Q(subjects__icontains=q)
            )

        return queryset


class AdminReviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        from django.shortcuts import get_object_or_404

        profile = get_object_or_404(TutorProfile, pk=pk)
        action = request.data.get('action')
        reason = request.data.get('reason', '')

        status_obj, _ = TutorStatus.objects.get_or_create(tutor=profile)

        if action == 'approve':
            status_obj.status = TutorStatus.State.APPROVED
            status_obj.save()
            TutorKYC.objects.filter(tutor=profile, status=TutorKYC.Status.SUBMITTED).update(status=TutorKYC.Status.VERIFIED)
            return Response({"message": "Tutor approved successfully.", "status": "APPROVED"})

        elif action == 'reject':
            status_obj.status = TutorStatus.State.PROFILE_INCOMPLETE
            status_obj.save()
            TutorKYC.objects.filter(tutor=profile, status=TutorKYC.Status.SUBMITTED).update(
                status=TutorKYC.Status.REJECTED,
                rejection_reason=reason,
            )
            return Response({"message": "Tutor rejected.", "status": "PROFILE_INCOMPLETE", "reason": reason})

        return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)


class CreateAdminUserView(APIView):
    """Superadmin creates a new Admin user with specific department."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from django.db import transaction
        from jobs.admin_models import AdminProfile

        if request.user.role != 'SUPERADMIN':
            return Response({"error": "Only Superadmins can create new admins."}, status=403)

        data = request.data
        username = data.get('username')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        role = data.get('role')

        if not all([username, email, phone, password, role]):
            return Response({"error": "All fields are required."}, status=400)

        if role == 'SUPERADMIN':
            return Response({"error": "Cannot create Superadmin accounts via this interface."}, status=400)

        valid_roles = ['COUNSELLOR', 'TUTOR_ADMIN']
        if role not in valid_roles:
            return Response({"error": f"Invalid role. Choices: {valid_roles}"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=400)

        if User.objects.filter(phone=phone).exists():
            return Response({"error": "Phone already exists."}, status=400)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username, email=email, phone=phone,
                    password=password, role=role,
                )
                # Note: If AdminProfile is still needed for other reasons, it can be created here. 
                # Otherwise, roles are native now.

            return Response({
                "message": f"Admin {username} created successfully as {role}",
                "user_id": user.id,
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
