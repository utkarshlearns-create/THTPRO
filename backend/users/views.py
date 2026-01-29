from rest_framework import generics, permissions, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, TutorProfileSerializer, CustomTokenObtainPairSerializer, TutorKYCSerializer, TutorStatusSerializer
from .models import TutorProfile, TutorKYC, TutorStatus
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import generate_otp, send_otp_to_phone, verify_google_token
import sys
import uuid

User = get_user_model()

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
        
        # Generate tokens for auto-login
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "User created successfully",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role
        }, status=status.HTTP_201_CREATED)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = generate_otp()
        cache_key = f"otp_{phone}"
        cache.set(cache_key, otp, timeout=300) # 5 minutes
        
        send_otp_to_phone(phone, otp)
        
        return Response({"message": "OTP sent successfully"})

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        role = request.data.get('role', 'PARENT') # Default if new user

        if not phone or not otp:
            return Response({"error": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_{phone}")
        
        if not cached_otp or cached_otp != otp:
             return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # OTP Verified - Get or Create User
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            # Create new user
            username = f"user_{phone}"
            user = User.objects.create_user(username=username, phone=phone, role=role)
            user.set_unusable_password()
            user.save()
        
        # Generate Tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role
        })

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        role = request.data.get('role', 'PARENT')
        
        print(f"DEBUG: GoogleLoginView received token. Role: {role}", file=sys.stderr)

        if not token:
            print("ERROR: No token provided", file=sys.stderr)
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        google_data = verify_google_token(token)
        if not google_data:
             # Should not happen with new utils logic but safety check
            print("ERROR: verify_google_token returned None", file=sys.stderr)
            return Response({"error": "Invalid Google Token (Unknown Error)"}, status=status.HTTP_400_BAD_REQUEST)
            
        if 'error' in google_data:
             return Response({"error": google_data['error']}, status=status.HTTP_400_BAD_REQUEST)

        email = google_data.get('email')
        email = google_data.get('email')
        # Ensure name is not None. Fallback to part of email if name is missing.
        name = google_data.get('name') or google_data.get('given_name') or email.split('@')[0]
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # If user does not exist and NO role is provided (Login Flow), ask for it.
            if not request.data.get('role'):
                 return Response({
                     "status": "role_required",
                     "email": email,
                     "name": name,
                     "message": "User not found. Please select a role."
                 }, status=status.HTTP_200_OK)

            # Create User with provided role (Signup Flow or Second Step of Login)
            try:
                base_username = email.split('@')[0]
                unique_username = f"{base_username}_{uuid.uuid4().hex[:6]}"
                user = User.objects.create_user(
                    username=unique_username,
                    email=email,
                    first_name=name,
                    role=role
                )
                user.set_unusable_password()
                user.save()
            except Exception as e:
                import traceback
                print(f"CRITICAL ERROR in GoogleLoginView User Creation: {traceback.format_exc()}", file=sys.stderr)
                return Response({"error": f"Signup failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role
        })

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class TutorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = TutorProfile.objects.get_or_create(user=self.request.user)
        return profile

class KYCSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'TEACHER':
            return Response({"error": "Only tutors can submit KYC."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = user.tutor_profile
        
        # 1. Check Profile Completion
        if profile.profile_completion_percentage < 100:
            return Response({
                "error": "Profile must be 100% complete before KYC submission.",
                "current_percentage": profile.profile_completion_percentage
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # 2. Check Submission Count
        kyc_record = TutorKYC.objects.filter(tutor=profile).order_by('-created_at').first()
        submission_count = kyc_record.submission_count if kyc_record else 0
        
        if submission_count >= 3:
            return Response({"error": "Maximum KYC attempts (3) exceeded. Contact support."}, status=status.HTTP_403_FORBIDDEN)
            
        # 3. Handle File Uploads & Create/Update KYC
        serializer = TutorKYCSerializer(data=request.data)
        if serializer.is_valid():
            # Create new KYC record or update? Usually new record for history, or update single record.
            # Let's create new usually, but requirement says "Increment submission count".
            # For simplicity, let's CREATE a new attempt if previous was rejected, or UPDATE if DRAFT.
            # But simpler: Just create/update the active one.
            
            # Since fields are optional in model but required for KYC, checks could be here.
            # Assuming frontend sends files.
            
            kyc_instance = serializer.save(
                tutor=profile,
                status=TutorKYC.Status.SUBMITTED,
                submission_count=submission_count + 1
            )
            
            # 4. Update Main Status
            status_obj, _ = TutorStatus.objects.get_or_create(tutor=profile)
            status_obj.status = TutorStatus.State.KYC_SUBMITTED
            status_obj.save()
            
            # Also auto-move to UNDER_REVIEW for now (or wait for admin to see it)
            # Req: TutorStatus = KYC_SUBMITTED -> UNDER_REVIEW
            status_obj.status = TutorStatus.State.UNDER_REVIEW
            status_obj.save()

            return Response({"message": "KYC Submitted successfully.", "status": status_obj.status}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminTutorListView(generics.ListAPIView):
    # Retrieve all tutors for admin dashboard
    queryset = TutorProfile.objects.all()
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAdminUser] # Ensure only admin

class AdminReviewView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        profile = get_object_or_404(TutorProfile, pk=pk)
        action = request.data.get('action') # 'approve' or 'reject'
        reason = request.data.get('reason', '')
        
        status_obj, _ = TutorStatus.objects.get_or_create(tutor=profile)
        
        if action == 'approve':
            status_obj.status = TutorStatus.State.APPROVED
            status_obj.save()
            
            # Update KYC record too
            TutorKYC.objects.filter(tutor=profile, status=TutorKYC.Status.SUBMITTED).update(status=TutorKYC.Status.VERIFIED)
            
            return Response({"message": "Tutor approved successfully.", "status": "APPROVED"})
            
        elif action == 'reject':
            status_obj.status = TutorStatus.State.PROFILE_INCOMPLETE # Reset to incomplete as per req? 
            # Req: "TutorStatus = PROFILE_INCOMPLETE"
            status_obj.save()
            
            # Update KYC record
            TutorKYC.objects.filter(tutor=profile, status=TutorKYC.Status.SUBMITTED).update(
                status=TutorKYC.Status.REJECTED,
                rejection_reason=reason
            )
            
            return Response({"message": "Tutor rejected.", "status": "PROFILE_INCOMPLETE", "reason": reason})
            
        return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # In the future, this will query the Application model
        # For now, return mock data or zeros
        
        # stats = {
        #     "total_applications": Application.objects.filter(tutor__user=request.user).count(),
        #     "accepted_applications": Application.objects.filter(tutor__user=request.user, status='ACCEPTED').count()
        # }
        
        stats = {
            "total_applications": 0,
            "accepted_applications": 0
        }
        return Response(stats)

from django.views import View
from django.http import JsonResponse
import traceback
import sys
from django.db import transaction

# ... existing imports ...

class DebugTutorSignupView(View):
    # Bypass DRF permissions
    def get(self, request):
        print("DEBUG: Starting Tutor Signup logic check...", file=sys.stderr)
        
        phone = "9988776600" 
        username = "TutorDebug"
        
        try:
            # 1. Cleanup
            User.objects.filter(phone=phone).delete()
            User.objects.filter(username=username).delete()
            print("DEBUG: Cleanup done.", file=sys.stderr)

            # 2. Simulate Signup
            with transaction.atomic():
                # Correct usage: User.objects.create_user handles hashing
                # Frontend sends 'TEACHER' (all caps).
                # Model definition: TEACHER = 'TEACHER', 'Teacher'
                user = User.objects.create_user(
                    username=username,
                    phone=phone,
                    password="password123",
                    role='TEACHER' 
                )
                print(f"DEBUG: User created: {user} (Role: {user.role})", file=sys.stderr)
                
                # 3. Check Signal Results
                profile_exists = TutorProfile.objects.filter(user=user).exists()
                status_exists = TutorStatus.objects.filter(tutor__user=user).exists()
                
                print(f"DEBUG: Profile Exists? {profile_exists}", file=sys.stderr)
                print(f"DEBUG: Status Exists? {status_exists}", file=sys.stderr)
                
                # If these fail, we know the signal is broken
                if not profile_exists:
                    raise Exception("Signal failed: TutorProfile not created")
                if not status_exists:
                    raise Exception("Signal failed: TutorStatus not created")

            return JsonResponse({
                "message": "Tutor Signup Logic passed!",
                "user_id": user.id,
                "profile_exists": profile_exists,
                "status_exists": status_exists
            })
            
        except Exception as e:
            tb = traceback.format_exc()
            print(f"ERROR in DebugTutorSignupView: {tb}", file=sys.stderr)
            return JsonResponse({"error": str(e), "traceback": tb}, status=500)




