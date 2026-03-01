import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/brahm/THTPRO/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import TutorProfile, TutorKYC, TutorStatus

def run():
    print("Starting verification of existing tutors...")
    profiles = TutorProfile.objects.all()
    verified_count = 0
    
    for profile in profiles:
        # Check if they already have an APPROVED status
        status_record, created = TutorStatus.objects.get_or_create(tutor=profile)
        if status_record.status != 'APPROVED':
            status_record.status = 'APPROVED'
            status_record.save()
            
        # Ensure they have a VERIFIED KYC record
        if not profile.kyc_records.filter(status='VERIFIED').exists():
            kyc = TutorKYC.objects.create(
                tutor=profile,
                status='VERIFIED'
            )
            print(f"Verified KYC for {profile.full_name or profile.user.first_name}")
            
        verified_count += 1
        
    print(f"Successfully verified {verified_count} tutors.")

if __name__ == '__main__':
    run()
