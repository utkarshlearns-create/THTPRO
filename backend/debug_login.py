import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

SECURE_ID = "secure_admin"
PASSKEY = "AdminPass123!"

print(f"--- Debugging Login for {SECURE_ID} ---")

# 1. Direct DB Lookup
try:
    user = User.objects.get(phone=SECURE_ID)
    print(f"[OK] User found by phone='{SECURE_ID}'")
    print(f"    ID: {user.id}")
    print(f"    Username: {user.username}")
    print(f"    Role: {user.role}")
    print(f"    Is Active: {user.is_active}")
    print(f"    Password Valid: {user.check_password(PASSKEY)}")
except User.DoesNotExist:
    print(f"[FAIL] User with phone='{SECURE_ID}' DOES NOT EXIST.")
    # Try finding by username to see what happened
    try:
        u2 = User.objects.get(username="superadmin")
        print(f"    BUT User 'superadmin' exists. Phone is: '{u2.phone}'")
    except User.DoesNotExist:
        print("    User 'superadmin' also does not exist.")

# 2. Test Backend Authentication
print("\n--- Testing authenticate() function ---")
user_auth = authenticate(username=SECURE_ID, password=PASSKEY)
if user_auth:
    print(f"[OK] authenticate() returned user: {user_auth}")
else:
    print(f"[FAIL] authenticate() returned None.")
    print("    This means PhoneBackend or ModelBackend rejected it.")
