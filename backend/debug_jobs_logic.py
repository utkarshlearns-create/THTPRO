
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from jobs.models import JobPost
from jobs.serializers import JobPostSerializer
from rest_framework.test import APIRequestFactory

User = get_user_model()

def debug_jobs():
    print("--- Debugging Jobs API Logic ---")
    
    # 1. Get or Create a Parent User
    parent_user, created = User.objects.get_or_create(username='debug_parent', defaults={'role': 'PARENT'})
    if created:
        parent_user.set_password('password123')
        parent_user.save()
    print(f"Parent User: {parent_user} (Role: {parent_user.role})")

    # 2. Get or Create a Tutor User
    try:
        tutor_user, created = User.objects.get_or_create(username='debug_tutor', defaults={'role': 'TEACHER'})
        print(f"Tutor User: {tutor_user} (Role: {tutor_user.role})")
    except Exception as e:
        print(f"ERROR Creating Tutor User: {e}")
        import traceback
        traceback.print_exc()

    # 3. Create a JobPost
    try:
        job = JobPost.objects.create(
            parent=parent_user,
            student_name="Debug Student",
            student_gender="Male",
            class_grade="Class 10",
            board="CBSE",
            subjects=["Math", "Science"],
            locality="Debug Locality",
            status="OPEN"
        )
        print(f"Job Created: {job}")
    except Exception as e:
        print(f"ERROR Creating Job: {e}")
        import traceback
        traceback.print_exc()

    # 4. Serialize JobPost
    try:
        serializer = JobPostSerializer(job)
        print(f"Serialized Data: {serializer.data}")
    except Exception as e:
        print(f"ERROR Serializing Job: {e}")
        return

    # 5. Simulate Queryset Filter (Tutor View)
    try:
        jobs = JobPost.objects.filter(status='OPEN').order_by('-created_at')
        print(f"Open Jobs Count: {jobs.count()}")
        for j in jobs:
            print(f" - {j}")
    except Exception as e:
        print(f"ERROR Querying Jobs: {e}")

if __name__ == "__main__":
    debug_jobs()
