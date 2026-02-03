from django.urls import path
from .views import (
    # Tutor endpoints
    TutorJobCreateView,
    JobCreateView,
    TutorJobListView,
    TutorApplicationsView,
    
    # Admin endpoints
    AdminPendingJobsView,
    AdminApproveJobView,
    AdminRejectJobView,
    AdminRequestModificationsView,
    
    # Parent endpoints
    ParentJobListView,
    JobDetailView,
    
    # Notification endpoints
    NotificationListView,
    MarkNotificationReadView,
)

urlpatterns = [
    # General endpoints
    path('create/', JobCreateView.as_view(), name='job-create'),
    # Tutor endpoints
    path('tutor/create/', TutorJobCreateView.as_view(), name='tutor-job-create'),
    path('tutor/my-jobs/', TutorJobListView.as_view(), name='tutor-job-list'),
    path('tutor/applications/', TutorApplicationsView.as_view(), name='tutor-applications'),
    
    # Admin endpoints
    path('admin/pending/', AdminPendingJobsView.as_view(), name='admin-pending-jobs'),
    path('admin/<int:pk>/approve/', AdminApproveJobView.as_view(), name='admin-approve-job'),
    path('admin/<int:pk>/reject/', AdminRejectJobView.as_view(), name='admin-reject-job'),
    path('admin/<int:pk>/request-modifications/', AdminRequestModificationsView.as_view(), name='admin-request-modifications'),
    
    # Parent endpoints
    path('parent/approved/', ParentJobListView.as_view(), name='parent-approved-jobs'),
    path('', ParentJobListView.as_view(), name='job-list'), # Also serve at root of jobs/
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    
    # Notification endpoints
    path('notifications/', NotificationListView.as_view(), name='user-notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]
