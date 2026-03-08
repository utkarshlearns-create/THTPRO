import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from jobs.models import Application, JobPost
from django.contrib.auth import get_user_model

User = get_user_model()

# Get the counsellor user
user = User.objects.filter(role='COUNSELLOR').last()

if user:
    # Update jobs that have a SHORTLISTED or HIRED application but no assigned admin
    jobs_to_update = JobPost.objects.filter(applications__status__in=['SHORTLISTED', 'HIRED'], assigned_admin__isnull=True)
    count = jobs_to_update.count()
    if count > 0:
        jobs_to_update.update(assigned_admin=user)
        print(f"Updated {count} jobs to be managed by {user.username} ({user.email})")
    else:
        print("No unassigned shortlisted/hired jobs found.")
else:
    print("No COUNSELLOR found.")
