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
        parser.add_argument('--skip-rows', type=int, default=0, help='Number of rows to skip')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting import from {csv_file_path}...'))
        
        count_created = 0
        count_skipped = 0
        
        skip_rows = options.get('skip_rows', 0)
        current_row = 0
        
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Sanitize headers
            if reader.fieldnames:
                reader.fieldnames = [name.strip().replace('\n', '') for name in reader.fieldnames]
            
            for row in reader:
                current_row += 1
                if current_row <= skip_rows:
                    if current_row % 100 == 0:
                        self.stdout.write(f'Scanning... skipped {current_row} rows')
                    continue

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
                        
                    # Handle User creation or retrieval
                    user, created = User.objects.get_or_create(
                        username=phone,
                        defaults={
                            'email': email,
                        }
                    )
                    
                    if created:
                        user.set_password('Tutor@123')
                        user.role = 'TEACHER'
                        user.phone = phone
                        user.save()
                        count_created += 1
                        self.stdout.write(self.style.SUCCESS(f'Created user: {full_name} ({phone})'))
                    else:
                        count_skipped += 1
                        if (count_created + count_skipped) % 100 == 0:
                             self.stdout.write(self.style.WARNING(f'Progress: processed {count_created + count_skipped} rows...'))

                    # Check or Create Profile
                    profile, profile_created = TutorProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            'full_name': full_name,
                            'gender': gender,
                            'subjects': subjects,
                            'locality': locality,
                            'teaching_experience_years': experience,
                            'teaching_mode': mode,
                            'local_address': local_address,
                            'permanent_address': perm_address,
                            'profile_completion_percentage': 80
                        }
                    )
                    
                    if profile_created:
                         # Activate Status
                        TutorStatus.objects.get_or_create(
                            tutor=profile,
                            defaults={'status': 'ACTIVE'}
                        )
                        if not created: # If user was existing but profile was missing
                             self.stdout.write(self.style.SUCCESS(f'Created missing profile for: {full_name}'))
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing row {full_name}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Import Complete. Created: {count_created}, Skipped: {count_skipped}'))
