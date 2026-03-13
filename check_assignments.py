import os
import sys
import django

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from jobs.models import JobPost, Application, AdminTask

print("\nListing all tasks for Job 3:")
tasks = AdminTask.objects.filter(job_post_id=3)
for t in tasks:
    print(f"  Task {t.id}: Type={t.task_type}, Status={t.status}, Admin={t.admin.username}")
