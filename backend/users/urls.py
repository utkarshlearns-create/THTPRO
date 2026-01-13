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
    SetupAdminView
)

urlpatterns = [
    path('setup-admin/', SetupAdminView.as_view(), name='setup-admin'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', TutorProfileView.as_view(), name='tutor_profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('kyc/submit/', KYCSubmissionView.as_view(), name='kyc_submission'),
    path('admin/tutors/', AdminTutorListView.as_view(), name='admin_tutor_list'),
    path('admin/tutors/<int:pk>/review/', AdminReviewView.as_view(), name='admin_review'),
]
