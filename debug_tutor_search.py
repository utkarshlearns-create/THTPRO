
import os
import sys
import django
from django.conf import settings
from unittest.mock import Mock

# Add backend to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from users.models import TutorProfile, User
from users.serializers import PublicTutorProfileSerializer

def debug_serializer():
    print("Fetching active tutors...")
    tutors = TutorProfile.objects.filter(status_record__status='ACTIVE')[:5]
    print(f"Found {len(tutors)} tutors to test.")

    # Mock Request
    request = Mock()
    request.user = User.objects.filter(role='PARENT').first()
    if not request.user:
        print("No parent user found, using any user.")
        request.user = User.objects.first()
        
    print(f"Testing with user: {request.user}")

    context = {'request': request}
    
    for tutor in tutors:
        print(f"\nSerializing {tutor.user.username}...")
        try:
            serializer = PublicTutorProfileSerializer(tutor, context=context)
            data = serializer.data
            print("Success!")
            # proper printing of contact info to verify unlock logic (it should be None or dict)
            print(f"Is Unlocked: {data.get('is_unlocked')}")
            print(f"Contact Info: {data.get('contact_info')}")
        except Exception as e:
            print(f"FAILED: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    debug_serializer()
