from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path

# Auth views
from .views import (
    CustomTokenObtainPairView,
    CurrentUserView,
    SignupView,
    GoogleLoginView,
    AdminTutorListView,
    AdminReviewView,
    CreateAdminUserView,
)

# Tutor views
from .tutor_views import (
    TutorProfileView,
    DashboardStatsView,
    PublicTutorSearchView,
    PublicTutorDetailView,
    ContactUnlockView,
    UnlockedContactsView,
    FavouriteTutorToggleView,
    FavouriteTutorListView,
)

# Institution views
from .institution_views import (
    InstitutionProfileView,
    InstitutionTutorListView,
)

# Enquiry views
from .enquiry_views import (
    EnquiryCreateView,
    AdminEnquiryListView,
    AdminEnquiryUpdateView,
)

# Admin views
from .admin_views import (
    UserManagementView,
    UserStatusView,
    UserUpdateView,
    SuperAdminAnalyticsView,
    AdminPerformanceView,
)

# KYC views
from .kyc_views import (
    KYCDocumentUploadView,
    KYCStatusView,
    AdminPendingKYCView,
    AdminKYCVerifyView,
)


urlpatterns = [
    # Auth
    path('signup/', SignupView.as_view(), name='signup'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),

    # Tutor profile & search
    path('profile/', TutorProfileView.as_view(), name='tutor_profile'),
    path('tutor/<int:pk>/unlock/', ContactUnlockView.as_view(), name='tutor_unlock'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/unlocked-contacts/', UnlockedContactsView.as_view(), name='unlocked_contacts'),
    path('tutors/search/', PublicTutorSearchView.as_view(), name='public_tutor_search'),
    path('tutors/<int:pk>/', PublicTutorDetailView.as_view(), name='public_tutor_detail'),
    path('tutors/<int:pk>/favourite/', FavouriteTutorToggleView.as_view(), name='tutor_favourite_toggle'),
    path('dashboard/favourite-tutors/', FavouriteTutorListView.as_view(), name='favourite_tutors_list'),

    # Institution
    path('institution/profile/', InstitutionProfileView.as_view(), name='institution_profile'),
    path('institution/tutors/', InstitutionTutorListView.as_view(), name='institution_tutor_list'),

    # KYC Endpoints
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
