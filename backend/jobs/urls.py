from django.urls import path
from .views import (
    # Tutor endpoints
    TutorJobCreateView,
    TutorJobListView,
    
    # Admin endpoints
    AdminPendingJobsView,
    AdminApproveJobView,
    AdminRejectJobView,
    AdminRequestModificationsView,
    
    # Parent endpoints
    ParentApprovedJobsView,
    
    # Notification endpoints
    UserNotificationsView,
    MarkNotificationReadView,
    UnreadNotificationCountView,
    
    # Legacy/existing endpoints
    JobPostListCreateView,
    JobPostDetailView,
    ParentDashboardStatsView
)

urlpatterns = [
    # Tutor endpoints
    path('tutor/create/', TutorJobCreateView.as_view(), name='tutor-job-create'),
    path('tutor/my-jobs/', TutorJobListView.as_view(), name='tutor-job-list'),
    
    # Admin endpoints
    path('admin/pending/', AdminPendingJobsView.as_view(), name='admin-pending-jobs'),
    path('admin/<int:pk>/approve/', AdminApproveJobView.as_view(), name='admin-approve-job'),
    path('admin/<int:pk>/reject/', AdminRejectJobView.as_view(), name='admin-reject-job'),
    path('admin/<int:pk>/request-modifications/', AdminRequestModificationsView.as_view(), name='admin-request-modifications'),
    
    # Parent endpoints
    path('parent/approved/', ParentApprovedJobsView.as_view(), name='parent-approved-jobs'),
    
    # Notification endpoints
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/unread-count/', UnreadNotificationCountView.as_view(), name='unread-notification-count'),
    
    # Legacy endpoints (backward compatibility)
    path('', JobPostListCreateView.as_view(), name='job-list-create'),
    path('<int:pk>/', JobPostDetailView.as_view(), name='job-detail'),
    path('stats/parent/', ParentDashboardStatsView.as_view(), name='parent-stats'),
]
