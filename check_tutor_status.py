
import os
import sys
import django
from django.conf import settings

# Add backend to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from users.models import TutorProfile, TutorStatus
from django.db.models import Count

def check_status():
    total_tutors = TutorProfile.objects.count()
    print(f"Total Tutor Profiles: {total_tutors}")
    
    status_counts = TutorStatus.objects.values('status').annotate(count=Count('status'))
    print("\nTutor Status Distribution:")
    for entry in status_counts:
        print(f"{entry['status']}: {entry['count']}")

    # Check how many have NO status record
    tutors_with_status = TutorStatus.objects.values_list('tutor_id', flat=True)
    tutors_without_status = TutorProfile.objects.exclude(id__in=tutors_with_status).count()
    print(f"\nTutors without ANY status record: {tutors_without_status}")

    # Check ACTIVE tutors specifically
    active_count = TutorProfile.objects.filter(status_record__status='ACTIVE').count()
    print(f"\nActive Tutors (via query used in view): {active_count}")

if __name__ == "__main__":
    check_status()
