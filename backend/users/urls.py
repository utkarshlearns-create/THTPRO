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
    GoogleLoginView,
    ContactUnlockView,
    ContactUnlockView,
    CreateAdminUserView
)
from .debug_views import DebugTokenView
from .admin_views import UserManagementView, UserStatusView, UserUpdateView, SuperAdminAnalyticsView, AdminPerformanceView

# NEW: Import KYC views
from .kyc_views import (
    KYCDocumentUploadView,
    KYCStatusView,
    AdminPendingKYCView,
    AdminPendingKYCView,
    AdminKYCVerifyView
)
from .views import EnquiryCreateView, AdminEnquiryListView, AdminEnquiryUpdateView

urlpatterns = [
    path('debug-token/', DebugTokenView.as_view(), name='debug_token'),
    path('debug-tutor/', DebugTutorSignupView.as_view(), name='debug-tutor'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', TutorProfileView.as_view(), name='tutor_profile'),
    path('tutor/<int:pk>/unlock/', ContactUnlockView.as_view(), name='tutor_unlock'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # Legacy KYC endpoint
    path('kyc/submit/', KYCSubmissionView.as_view(), name='kyc_submission'),
    
    # NEW KYC Endpoints
    path('kyc/upload/', KYCDocumentUploadView.as_view(), name='kyc_upload'),
    path('kyc/status/', KYCStatusView.as_view(), name='kyc_status'),
    
    # Superadmin endpoints
    path('superadmin/create-admin/', CreateAdminUserView.as_view(), name='create_admin'),
    path('superadmin/users/', UserManagementView.as_view(), name='superadmin_users'),
    path('superadmin/users/<int:pk>/', UserUpdateView.as_view(), name='superadmin_user_update'),
    path('superadmin/users/<int:pk>/status/', UserStatusView.as_view(), name='superadmin_user_status'),
    path('superadmin/analytics/', SuperAdminAnalyticsView.as_view(), name='superadmin_analytics'),
    path('superadmin/admin-performance/', AdminPerformanceView.as_view(), name='superadmin_admin_performance'),
    
    # Admin endpoints
    path('admin/tutors/', AdminTutorListView.as_view(), name='admin_tutor_list'),
    path('admin/tutors/<int:pk>/review/', AdminReviewView.as_view(), name='admin_review'),
    path('admin/kyc/pending/', AdminPendingKYCView.as_view(), name='admin_pending_kyc'),
    path('admin/kyc/<int:pk>/verify/', AdminKYCVerifyView.as_view(), name='admin_kyc_verify'),
    
    # Enquiries
    path('contact/', EnquiryCreateView.as_view(), name='enquiry_create'),
    path('admin/enquiries/', AdminEnquiryListView.as_view(), name='admin_enquiry_list'),
    path('admin/enquiries/<int:pk>/', AdminEnquiryUpdateView.as_view(), name='admin_enquiry_update'),
]
