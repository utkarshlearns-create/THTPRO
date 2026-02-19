
import csv
import os
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import TutorProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Restore tutor profile images from CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Reading {csv_file_path}...'))
        
        count_updated = 0
        count_skipped = 0
        
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            headers = [h.strip().replace('\n', ' ') for h in reader.fieldnames] if reader.fieldnames else []
            
            # Identify Photo Column
            photo_col = None
            for h in headers:
                upper_h = h.upper()
                if 'PHOTO' in upper_h and 'AADHAAR' not in upper_h and 'MARKSHEET' not in upper_h and 'PAN' not in upper_h:
                    photo_col = h
                    break
            
            # Fallback attempts
            if not photo_col:
                for h in headers:
                    if 'YOUR PHOTO' in h.upper():
                         photo_col = h
                         break
            
            self.stdout.write(f"Detected Photo Column: {photo_col}")
            
            if not photo_col:
                self.stdout.write(self.style.ERROR("Could not identify Photo column. Available headers:"))
                self.stdout.write(str(headers))
                return

            # Re-read to reset cursor or just use DictReader which read header
            # But header modification above was just for detection.
            # We need to map the *actual* key from DictReader which might have newlines.
            
            # Let's verify the actual key name in the reader
            actual_photo_key = None
            for key in reader.fieldnames:
                clean_key = key.strip().replace('\n', ' ')
                if clean_key == photo_col:
                    actual_photo_key = key
                    break
            
            # If still null, try fuzzy match against raw keys
            if not actual_photo_key:
                 for key in reader.fieldnames:
                    upper_h = key.upper()
                    if 'PHOTO' in upper_h and 'AADHAAR' not in upper_h and 'MARKSHEET' not in upper_h:
                        actual_photo_key = key
                        break
            
            self.stdout.write(f"Using CSV Key: {actual_photo_key}")

            for row in reader:
                try:
                    full_name = row.get('NAME', '').strip() or row.get('Full Name', '').strip() or "Unknown"
                    
                    # Phone extraction logic (Same as import)
                    phone_raw = row.get('CALLING NUMBER , WHATSAPP NUMBER , ALTERNATE NUMBER', '') or row.get('Phone', '')
                    phone = ''.join(filter(str.isdigit, phone_raw.split(',')[0]))[-10:]
                    
                    if not phone:
                         continue
                         
                    # Find Tutor
                    try:
                        user = User.objects.get(phone=phone)
                        profile = user.tutor_profile
                        
                        image_url = row.get(actual_photo_key, '').strip()
                        if image_url:
                            # Verify if it has data
                            profile.external_profile_image_url = image_url
                            profile.save()
                            count_updated += 1
                            # self.stdout.write(f"Updated {full_name}")
                        else:
                            # self.stdout.write(f"No image URL for {full_name}")
                            pass
                            
                    except User.DoesNotExist:
                        # self.stdout.write(f"User not found for {phone}")
                        count_skipped += 1
                    except Exception as e:
                        self.stdout.write(f"Error updating {full_name}: {e}")
                        
                except Exception as e:
                    pass

        self.stdout.write(self.style.SUCCESS(f'Update Complete. Updated: {count_updated}, Skipped/Missing: {count_skipped}'))
