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
    DebugTutorSignupView,
    SendOTPView,
    VerifyOTPView,
    GoogleLoginView
)

# NEW: Import KYC views
from .kyc_views import (
    KYCDocumentUploadView,
    KYCStatusView,
    AdminPendingKYCView,
    AdminKYCVerifyView
)

urlpatterns = [
    path('debug-tutor/', DebugTutorSignupView.as_view(), name='debug-tutor'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', TutorProfileView.as_view(), name='tutor_profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # Legacy KYC endpoint
    path('kyc/submit/', KYCSubmissionView.as_view(), name='kyc_submission'),
    
    # NEW KYC Endpoints
    path('kyc/upload/', KYCDocumentUploadView.as_view(), name='kyc_upload'),
    path('kyc/status/', KYCStatusView.as_view(), name='kyc_status'),
    
    # Admin endpoints
    path('admin/tutors/', AdminTutorListView.as_view(), name='admin_tutor_list'),
    path('admin/tutors/<int:pk>/review/', AdminReviewView.as_view(), name='admin_review'),
    path('admin/kyc/pending/', AdminPendingKYCView.as_view(), name='admin_pending_kyc'),
    path('admin/kyc/<int:pk>/verify/', AdminKYCVerifyView.as_view(), name='admin_kyc_verify'),
]
