from django.urls import path

# Tutor endpoints
from .tutor_job_views import (
    JobCreateView,
    MyJobPostsView,
    TutorApplicationsView,
    JobApplicationCreateView,
    JobApplicantsView,
)

# Tutor demo endpoints
from .tutor_demo_views import (
    TutorMarkDemoCompletedView,
    TutorScheduledDemosView,
)

# Admin endpoints
from .admin_job_views import (
    AdminDashboardStatsView,
    AdminPendingJobsView,
    AdminApproveJobView,
    AdminRejectJobView,
    AdminRequestModificationsView,
    AdminAssignTutorView,
    AdminUpdateJobView,
    AdminInstitutionJobListView,
    AdminJobListView,
    CounsellorClientsView,
    CounsellorClientHistoryView,
    TransferLeadView,
    TransferClientView
)
from users.admin_views import AdminListView

# Parent endpoints
from .parent_job_views import (
    ParentJobListView,
    JobDetailView,
    JobSearchFilterView,
    ParentStatsView,
    InstituteJobViewSet,
    ParentApplicationActionView,
    TutorRatingView,
    TutorAttendanceView,
    ParentCloseJobView,
    ParentDemoActionView,
    ParentConfirmTutorView,
)

# Notification endpoints
from .notification_views import (
    NotificationListView,
    MarkNotificationReadView,
)

# Master data views
from .master_views import (
    PublicMasterDataView,
    SubjectListCreateView, SubjectDetailView,
    BoardListCreateView, BoardDetailView,
    ClassLevelListCreateView, ClassLevelDetailView,
    LocationListCreateView, LocationDetailView,
    SeedMasterDataView,
)

# CRM views
from .crm_views import (
    CRMJobListView,
    CRMJobDetailView,
    CRMAssignAdminView,
    CRMUpdateStatusView,
    CRMAdminListView,
    CRMPipelineStatsView,
    AdminApplicationListView,
)


urlpatterns = [
    # General endpoints
    path('create/', JobCreateView.as_view(), name='job-create'),

    # Tutor endpoints
    path('tutor/my-jobs/', MyJobPostsView.as_view(), name='tutor-job-list'),
    path('my-jobs/', MyJobPostsView.as_view(), name='my-job-list'),
    path('tutor/applications/', TutorApplicationsView.as_view(), name='tutor-applications'),
    path('tutor/demos/', TutorScheduledDemosView.as_view(), name='tutor-scheduled-demos'),
    path('tutor/demos/<int:pk>/complete/', TutorMarkDemoCompletedView.as_view(), name='tutor-mark-demo-completed'),

    # Admin endpoints
    path('admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/pending/', AdminPendingJobsView.as_view(), name='admin-pending-jobs'),
    path('admin/<int:pk>/approve/', AdminApproveJobView.as_view(), name='admin-approve-job'),
    path('admin/<int:pk>/reject/', AdminRejectJobView.as_view(), name='admin-reject-job'),
    path('admin/<int:pk>/request-modifications/', AdminRequestModificationsView.as_view(), name='admin-request-modifications'),
    path('admin/<int:pk>/assign-tutor/', AdminAssignTutorView.as_view(), name='admin-assign-tutor'),
    path('admin/<int:pk>/update/', AdminUpdateJobView.as_view(), name='admin-update-job'),
    path('admin/institution-pending/', AdminInstitutionJobListView.as_view(), name='admin-institution-pending-jobs'),
    path('admin/all/', AdminJobListView.as_view(), name='admin-all-jobs'),
    
    # Counsellor "My Clients" & Transfers
    path('admin/my-clients/', CounsellorClientsView.as_view(), name='admin-my-clients'),
    path('admin/my-clients/<int:parent_id>/history/', CounsellorClientHistoryView.as_view(), name='admin-client-history'),
    path('admin/transfer-lead/<int:pk>/', TransferLeadView.as_view(), name='admin-transfer-lead'),
    path('admin/transfer-client/<int:parent_id>/', TransferClientView.as_view(), name='admin-transfer-client'),
    
    # Admin List for Transfers
    path('admin/list-admins/', AdminListView.as_view(), name='admin-list-admins'),

    # Parent endpoints
    path('parent/approved/', ParentJobListView.as_view(), name='parent-approved-jobs'),
    path('search/', JobSearchFilterView.as_view(), name='job-search'),
    path('stats/parent/', ParentStatsView.as_view(), name='parent-stats'),
    path('', ParentJobListView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('parent/application-action/<int:pk>/', ParentApplicationActionView.as_view(), name='parent-application-action'),
    path('parent/tutor-rating/', TutorRatingView.as_view(), name='parent-tutor-rating'),
    path('parent/tutor-attendance/', TutorAttendanceView.as_view(), name='parent-tutor-attendance'),
    path('parent/jobs/<int:pk>/close/', ParentCloseJobView.as_view(), name='parent-job-close'),
    path('parent/application-action/<int:pk>/demo/', ParentDemoActionView.as_view(), name='parent-demo-action'),
    path('parent/application-action/<int:pk>/confirm/', ParentConfirmTutorView.as_view(), name='parent-confirm-tutor'),

    # Job interactions
    path('<int:pk>/apply/', JobApplicationCreateView.as_view(), name='job-apply'),
    path('<int:pk>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),

    # Notification endpoints
    path('notifications/', NotificationListView.as_view(), name='user-notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),

    # Master Data endpoints
    path('master/', PublicMasterDataView.as_view(), name='master-data'),
    path('master/subjects/', SubjectListCreateView.as_view(), name='subject-list'),
    path('master/subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'),
    path('master/boards/', BoardListCreateView.as_view(), name='board-list'),
    path('master/boards/<int:pk>/', BoardDetailView.as_view(), name='board-detail'),
    path('master/class-levels/', ClassLevelListCreateView.as_view(), name='class-level-list'),
    path('master/class-levels/<int:pk>/', ClassLevelDetailView.as_view(), name='class-level-detail'),
    path('master/locations/', LocationListCreateView.as_view(), name='location-list'),
    path('master/locations/<int:pk>/', LocationDetailView.as_view(), name='location-detail'),
    path('master/seed/', SeedMasterDataView.as_view(), name='seed-master-data'),

    # Institution endpoints
    path('institution/jobs/', InstituteJobViewSet.as_view({'get': 'list', 'post': 'create'}), name='institution-job-list'),
    path('institution/jobs/<int:pk>/', InstituteJobViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='institution-job-detail'),

    # CRM endpoints (Superadmin)
    path('crm/jobs/', CRMJobListView.as_view(), name='crm-job-list'),
    path('crm/jobs/<int:pk>/', CRMJobDetailView.as_view(), name='crm-job-detail'),
    path('crm/jobs/<int:pk>/assign/', CRMAssignAdminView.as_view(), name='crm-assign-admin'),
    path('crm/jobs/<int:pk>/status/', CRMUpdateStatusView.as_view(), name='crm-update-status'),
    path('crm/admins/', CRMAdminListView.as_view(), name='crm-admin-list'),
    path('crm/pipeline/', CRMPipelineStatsView.as_view(), name='crm-pipeline-stats'),
    path('crm/applications/', AdminApplicationListView.as_view(), name='crm-application-list'),
]
