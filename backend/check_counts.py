import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, TutorProfile, TutorStatus, TutorKYC
from django.db.models import Count

print(f"Users: {User.objects.count()}")
print(f"TutorProfiles: {TutorProfile.objects.count()}")
print(f"Active Tutors: {TutorStatus.objects.filter(status='ACTIVE').count()}")
print(f"KYC Records: {TutorKYC.objects.count()}")
print(f"KYC VERIFIED: {TutorKYC.objects.filter(status='VERIFIED').count()}")
print("\nStatus breakdown:")
for s in TutorStatus.objects.values('status').annotate(c=Count('id')).order_by('-c'):
    print(f"  {s['status']}: {s['c']}")
