import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Override ALLOWED_HOSTS for this test
if '*' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
import json

User = get_user_model()
try:
    user = User.objects.get(id=6840)
    client = APIClient()
    client.force_authenticate(user=user)

    # Test /api/users/me/
    response = client.get('/api/users/me/')

    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        print(f"User ID: {data.get('id')}")
        print(f"Email: {data.get('email')}")
        print(f"Role: {data.get('role')}")
        print(f"Keys: {list(data.keys())}")
        if 'tutor_profile' in data:
            tp = data['tutor_profile']
            print(f"Tutor Profile Comp: {tp.get('profile_completion_percentage')}%")
            if 'kyc' in tp:
                print(f"KYC records found: {len(tp['kyc'])}")
    else:
        if hasattr(response, 'data'):
            print(f"Error Data: {response.data}")
        elif hasattr(response, 'content'):
            print(f"Error Content: {response.content.decode()}")
except Exception as e:
    import traceback
    print(f"Script Error: {e}")
    traceback.print_exc()
