import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# --- CONFIGURATION ---
# The User model uses 'phone' field for login lookup in PhoneBackend.
# The SuperAdminLogin.jsx asks for "Secure ID", which maps to this 'phone' field.
SECURE_ID = "secure_admin"  # This will be stored in the 'phone' field
PASSKEY = "AdminPass123!"

print(f"--- Setting up Superadmin Credentials ---")
print(f"Secure ID (stored as phone): {SECURE_ID}")
print(f"Passkey: {PASSKEY}")

try:
    # 1. Check if user exists by phone (which is our Secure ID)
    try:
        user = User.objects.get(phone=SECURE_ID)
        print(f"User with Secure ID '{SECURE_ID}' found. Updating password...")
    except User.DoesNotExist:
        # 2. Check if username 'superadmin' exists to avoid duplicates
        try:
            user = User.objects.get(username="superadmin")
            print(f"User 'superadmin' found. Updating Secure ID to '{SECURE_ID}'...")
            user.phone = SECURE_ID
        except User.DoesNotExist:
             print("Creating new Superadmin user...")
             user = User(username="superadmin")
             user.phone = SECURE_ID

    # 3. Apply updates
    user.set_password(PASSKEY)
    user.role = 'SUPERADMIN'
    user.is_superuser = True
    user.is_staff = True
    user.save()
    
    print("\nSUCCESS! Credentials Updated.")
    print("===========================================")
    print(f"LOGIN URL: /superadmin/login")
    print(f"SECURE ID: {SECURE_ID}")
    print(f"PASSKEY:   {PASSKEY}")
    print("===========================================")

except Exception as e:
    print(f"\nERROR: Could not set credentials. {str(e)}")
