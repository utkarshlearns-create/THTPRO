from django.urls import path
from .views import (
    # Tutor endpoints
    TutorJobCreateView,
    JobCreateView,
    MyJobPostsView,
    TutorApplicationsView,
    
    # Admin endpoints
    AdminPendingJobsView,
    AdminApproveJobView,
    AdminRejectJobView,
    AdminRequestModificationsView,
    
    # Parent endpoints
    ParentJobListView,
    JobDetailView,
    JobApplicationCreateView,
    JobApplicantsView,
    
    # Notification endpoints
    NotificationListView,
    MarkNotificationReadView,
    
    # Stats endpoints
    ParentStatsView,
)

urlpatterns = [
    # General endpoints
    path('create/', JobCreateView.as_view(), name='job-create'),
    # Tutor endpoints
    path('tutor/create/', TutorJobCreateView.as_view(), name='tutor-job-create'),
    path('tutor/my-jobs/', MyJobPostsView.as_view(), name='tutor-job-list'), # Legacy alias
    path('my-jobs/', MyJobPostsView.as_view(), name='my-job-list'), # Generic endpoint
    path('tutor/applications/', TutorApplicationsView.as_view(), name='tutor-applications'),
    
    # Admin endpoints
    path('admin/pending/', AdminPendingJobsView.as_view(), name='admin-pending-jobs'),
    path('admin/<int:pk>/approve/', AdminApproveJobView.as_view(), name='admin-approve-job'),
    path('admin/<int:pk>/reject/', AdminRejectJobView.as_view(), name='admin-reject-job'),
    path('admin/<int:pk>/request-modifications/', AdminRequestModificationsView.as_view(), name='admin-request-modifications'),
    
    # Parent endpoints
    path('parent/approved/', ParentJobListView.as_view(), name='parent-approved-jobs'),
    path('stats/parent/', ParentStatsView.as_view(), name='parent-stats'),
    path('', ParentJobListView.as_view(), name='job-list'), # Also serve at root of jobs/
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    
    # Job interactions
    path('<int:pk>/apply/', JobApplicationCreateView.as_view(), name='job-apply'),
    path('<int:pk>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
    
    # Notification endpoints
    path('notifications/', NotificationListView.as_view(), name='user-notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]
