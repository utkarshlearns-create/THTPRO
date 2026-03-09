"""Script to create/update the superadmin login credentials for emergency recovery."""

import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

SECURE_ID = 'secure_admin'
PASSKEY = 'AdminPass123!'

print('--- Setting up Superadmin Credentials ---')
print(f'Secure ID (stored as phone): {SECURE_ID}')

user, _ = User.objects.get_or_create(username='superadmin', defaults={'phone': SECURE_ID})
user.phone = SECURE_ID
user.set_password(PASSKEY)
user.role = 'SUPERADMIN'
user.is_superuser = True
user.is_staff = True
user.is_active = True
user.save()

print('\nSUCCESS! Credentials Updated.')
print('===========================================')
print('LOGIN URL: /superadmin/login')
print(f'SECURE ID: {SECURE_ID}')
print(f'PASSKEY:   {PASSKEY}')
print('===========================================')
