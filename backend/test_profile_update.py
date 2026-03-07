import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.serializers import TutorProfileSerializer

# Simulating the new frontend JSON payload
data = {
    'full_name': 'Aman Verma',
    'gender': 'Male',
    'marital_status': 'Married',
    'whatsapp_number': '1234567890',
    'dob': None,  # Was ''
    'teaching_experience_years': None, # Was ''
    'intermediate_year': None, # Was ''
}

serializer = TutorProfileSerializer(data=data, partial=True)
if not serializer.is_valid():
    print("VALIDATION ERRORS:", serializer.errors)
else:
    print("VALID!")
