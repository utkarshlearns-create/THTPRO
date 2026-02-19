
import requests
import re
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from users.models import TutorProfile

class Command(BaseCommand):
    help = 'Download images from external Google Drive URLs and save to profile_image field'


    def download_file_from_google_drive(self, id, destination_file_handle):
        URL = "https://docs.google.com/uc?export=download"

        session = requests.Session()

        response = session.get(URL, params = { 'id' : id }, stream = True)
        token = self.get_confirm_token(response)

        if token:
            params = { 'id' : id, 'confirm' : token }
            response = session.get(URL, params = params, stream = True)

        self.save_response_content(response, destination_file_handle)
        return response

    def get_confirm_token(self, response):
        for key, value in response.cookies.items():
            if key.startswith('download_warning'):
                return value
        return None

    def save_response_content(self, response, destination_file_handle):
        CHUNK_SIZE = 32768
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: # filter out keep-alive new chunks
                destination_file_handle.write(chunk)

    def handle(self, *args, **options):
        # Filter profiles that have an external URL but no internal image yet
        profiles = TutorProfile.objects.filter(external_profile_image_url__icontains='drive.google.com').exclude(profile_image__isnull=False).exclude(profile_image='')
        
        # Or if re-running, maybe just filter external_profile_image_url__isnull=False
        # Let's target only those without profile_image first to save time, or just all.
        # Given previous failure, some might be empty files.
        
        # Re-fetch query
        profiles = TutorProfile.objects.filter(external_profile_image_url__icontains='drive.google.com')
        
        total = profiles.count()
        self.stdout.write(f"Found {total} profiles with Google Drive images.")
        
        success_count = 0
        fail_count = 0
        
        for profile in profiles:
            url = profile.external_profile_image_url
            if not url: 
                continue
                
            # Extract File ID
            file_id = None
            match = re.search(r'id=([a-zA-Z0-9_-]+)', url)
            if match:
                file_id = match.group(1)
            else:
                match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
                if match:
                    file_id = match.group(1)
            
            if not file_id:
                fail_count += 1
                continue
            
            try:
                self.stdout.write(f"Downloading for {profile.full_name} ({file_id})...")
                
                # Use a temporary buffer or file
                # Since ContentFile expects content, we can download to memory (BytesIO)
                # But for large files, temp file is better. 
                # Django ContentFile accepts bytes or open file.
                
                import io
                buffer = io.BytesIO()
                
                response = self.download_file_from_google_drive(file_id, buffer)
                
                # Verify content type
                content_type = response.headers.get('content-type', '')
                if 'image' not in content_type and 'application/octet-stream' not in content_type:
                     self.stdout.write(self.style.WARNING(f"Not an image ({content_type}). Skipping."))
                     fail_count += 1
                     continue

                filename = f"tutor_{profile.user.id}_{file_id}.jpg"
                buffer.seek(0)
                profile.profile_image.save(filename, ContentFile(buffer.read()), save=True)
                
                success_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error {str(e)}"))
                fail_count += 1
                
        self.stdout.write(self.style.SUCCESS(f"Migration Complete. Success: {success_count}, Failed: {fail_count}"))
