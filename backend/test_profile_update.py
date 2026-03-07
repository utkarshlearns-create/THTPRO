import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.serializers import TutorProfileSerializer

# Let's see what fields are strictly required
serializer = TutorProfileSerializer()
for field_name, field in serializer.fields.items():
    if field.required:
        print(f"REQUIRED FIELD: {field_name}")

# Let's test a realistic payload with some empty strings that the frontend might send
data = {
    'full_name': 'Aman Verma',
    'gender': '',
    'marital_status': '',
    'whatsapp_number': '',
    'dob': None,
    'about_me': '',
    'locality': 'Some city',
    'local_address': '',
    'permanent_address': '',
    'highest_qualification': '',
    'teaching_experience_years': 0,
    'teaching_experience_school_years': 0,
    'expected_fee': None,
    'intermediate_stream': '',
    'intermediate_school': '',
    'intermediate_year': None,
    'intermediate_board': '',
    'highest_stream': '',
    'highest_year': None,
    'highest_university': '',
    'highest_college': '',
    'other_certifications': '',
    # what if 'classes' is an empty string instead of array?
    'classes': '',
    'subjects': '',
}

serializer = TutorProfileSerializer(data=data, partial=True)
if not serializer.is_valid():
    print("VALIDATION ERRORS FOR TYPICAL EMPTY PAYLOAD:", serializer.errors)
else:
    print("VALID PAYLOAD!")
