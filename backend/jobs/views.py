"""
jobs/views.py — Re-exports from modular view files for backward compatibility.

Actual implementations live in:
  - tutor_job_views.py    (tutor-facing: create, apply, applications)
  - admin_job_views.py    (admin: approve, reject, assign, stats)
  - parent_job_views.py   (parent: browse, search, dashboard stats)
  - notification_views.py (notifications: list, mark read)
  - crm_views.py          (superadmin CRM pipeline)
  - master_views.py       (superadmin master data CRUD)
"""

# Tutor endpoints
from .tutor_job_views import (
    JobCreateView,
    MyJobPostsView,
    TutorApplicationsView,
    JobApplicationCreateView,
    JobApplicantsView,
)

# Admin endpoints
from .admin_job_views import (
    AdminDashboardStatsView,
    AdminPendingJobsView,
    AdminApproveJobView,
    AdminRejectJobView,
    AdminRequestModificationsView,
    AdminAssignTutorView,
    AdminInstitutionJobListView,
)

# Parent endpoints
from .parent_job_views import (
    ParentJobListView,
    JobDetailView,
    JobSearchFilterView,
    ParentStatsView,
    InstituteJobViewSet,
)

# Notification endpoints
from .notification_views import (
    NotificationListView,
    MarkNotificationReadView,
)
