from rest_framework import generics, permissions, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, TutorProfileSerializer, CustomTokenObtainPairSerializer, TutorKYCSerializer, TutorStatusSerializer
from .models import TutorProfile, TutorKYC, TutorStatus
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

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

class SetupAdminView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        phone = "9876543210"
        try:
            if not User.objects.filter(phone=phone).exists():
                # Ensure username is unique if it defaults to empty string or if we are not providing one
                # Actually, AbstractUser requires username. We are providing "Super Admin".
                # But "Super Admin" might be taken? user.username must be unique.
                
                # Let's use phone as username to be safe
                u = User.objects.create_superuser(
                    phone=phone,
                    password="admin12345",
                    username=phone, # Use phone as username to ensure uniqueness
                    role='ADMIN'
                )
                return Response({"message": f"Superuser {phone} created successfully!"})
            return Response({"message": f"Superuser {phone} already exists."})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

