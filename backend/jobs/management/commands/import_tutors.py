import csv
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import TutorProfile, TutorStatus

User = get_user_model()

class Command(BaseCommand):
    help = 'Import tutors from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting import from {csv_file_path}...'))
        
        count_created = 0
        count_skipped = 0
        
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Sanitize headers
            if reader.fieldnames:
                reader.fieldnames = [name.strip().replace('\n', '') for name in reader.fieldnames]
            
            for row in reader:
                try:
                    # Mapping for Google Form Headers
                    full_name = row.get('NAME', '').strip() or row.get('Full Name', '').strip()
                    email = row.get('Email Address', '').strip() or row.get('Email', '').strip()
                    gender = row.get('Gender', '').strip()
                    
                    # Phone extraction (handle "9876543210" or "9876543210, 876...")
                    phone_raw = row.get('CALLING NUMBER , WHATSAPP NUMBER , ALTERNATE NUMBER', '') or row.get('Phone', '')
                    phone = ''.join(filter(str.isdigit, phone_raw.split(',')[0]))[-10:] # Take last 10 digits of first number
                    
                    if not phone:
                         # Try fallback
                         phone = ''.join(filter(str.isdigit, phone_raw))[-10:]

                    # Locality
                    locality = row.get('IN WHICH LOCATIONS YOU CAN TEACH', '') or row.get('Locality', '')
                    locality = locality.strip()
                    
                    # Experience
                    exp_raw = row.get('TEACHING EXPERIENCE IN YEARS', '0') or row.get('Experience', '0')
                    # Extract first number found
                    import re
                    exp_match = re.search(r'\d+', exp_raw)
                    experience = int(exp_match.group()) if exp_match else 0
                    
                    # Subjects aggregation
                    subjects = []
                    subj_cols = [
                        'Classes and Subjects',
                        'Which Subjects you can teach in class 9th and 10th',
                        'Which Subjects You Can Teach in Class 11th and 12th', 
                        'Any Additional Subject and Stream You can teach write in brief',
                        'Subjects'
                    ]
                    for col in subj_cols:
                        val = row.get(col)
                        if val:
                            # Split by comma or newline
                            parts = re.split(r'[,\n]+', val)
                            subjects.extend([p.strip() for p in parts if p.strip()])
                    
                    # Address
                    local_address = row.get('LOCAL ADDRESS') or row.get('Local Address', '')
                    perm_address = row.get('PERMANENT ADDRESS') or row.get('Permanent Address', '')
                    
                    # Document Links (Store in profile or just note)
                    # We have Aadhaar Front, Back, Marksheet, Photo links in CSV
                    # For now we won't download them, but we could store the links if model allowed.
                    # Model has FileFields, so we can't easily store URL string without downloading.
                    # We will skip doc import for now or store in a notes field if available.
                    
                    mode = row.get('Mode', 'BOTH').strip()

                    if not phone:
                        self.stdout.write(self.style.WARNING(f'Skipping row with missing phone: {full_name}'))
                        continue
                        
                    # Check if user exists
                    if User.objects.filter(username=phone).exists():
                        self.stdout.write(self.style.WARNING(f'User with phone {phone} already exists. Skipping.'))
                        count_skipped += 1
                        continue
                    
                    # Create User
                    user = User.objects.create_user(
                        username=phone,
                        email=email,
                        password='Tutor@123'
                    )
                    user.role = 'TEACHER'
                    user.phone = phone
                    user.save()
                    
                    # Create Profile
                    profile = TutorProfile.objects.create(
                        user=user,
                        full_name=full_name,
                        gender=gender,
                        subjects=subjects,
                        locality=locality,
                        teaching_experience_years=experience,
                        teaching_mode=mode,
                        local_address=local_address,
                        permanent_address=perm_address,
                        profile_completion_percentage=80
                    )
                    
                    # Activate Status
                    TutorStatus.objects.create(
                        tutor=profile,
                        status='ACTIVE'
                    )
                    
                    self.stdout.write(self.style.SUCCESS(f'Created tutor: {full_name} ({phone})'))
                    count_created += 1
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing row {full_name if "full_name" in locals() else "Unknown"}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Import Complete. Created: {count_created}, Skipped: {count_skipped}'))
