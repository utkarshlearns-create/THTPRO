from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    CurrentUserView,
    TutorProfileView,
    KYCSubmissionView,
    AdminReviewView,
    AdminTutorListView,
    SignupView,
    DashboardStatsView,
    SignupView,
    DashboardStatsView,
    DebugTutorSignupView,
    SendOTPView,
    VerifyOTPView,
    GoogleLoginView
)

urlpatterns = [
    path('debug-tutor/', DebugTutorSignupView.as_view(), name='debug-tutor'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', TutorProfileView.as_view(), name='tutor_profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('kyc/submit/', KYCSubmissionView.as_view(), name='kyc_submission'),
    path('admin/tutors/', AdminTutorListView.as_view(), name='admin_tutor_list'),
    path('admin/tutors/<int:pk>/review/', AdminReviewView.as_view(), name='admin_review'),
]
