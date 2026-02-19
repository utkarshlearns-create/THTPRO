
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import TutorProfile, TutorStatus
from django.db.models import Count

def debug_tutors():
    print("--- Tutor Status Counts ---")
    status_counts = TutorStatus.objects.values('status').annotate(count=Count('status'))
    for item in status_counts:
        print(f"{item['status']}: {item['count']}")
        
    print("\n--- ACTIVE Tutors Sample ---")
    active_tutors = TutorProfile.objects.filter(status_record__status='ACTIVE')[:5]
    print(f"Total Active Tutors: {active_tutors.count()}")
    
    for tutor in active_tutors:
        print(f"ID: {tutor.id} | Name: {tutor.full_name} | User: {tutor.user.email}")
        print(f"  Subjects ({type(tutor.subjects)}): {tutor.subjects}")
        print(f"  Classes ({type(tutor.classes)}): {tutor.classes}")
        print(f"  Locality: {tutor.locality}")
        print(f"  Mode: {tutor.teaching_mode}")
        print("-" * 30)

if __name__ == '__main__':
    debug_tutors()
