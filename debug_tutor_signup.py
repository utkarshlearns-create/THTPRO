
import os
import django
import traceback
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import TutorProfile, TutorStatus
from django.db import transaction

User = get_user_model()

def debug_create_tutor():
    print("--- Starting Tutor Signup Debug ---")
    
    phone = "9988776600" # Test number for tutor
    password = "tutorpassword123"
    username = "TutorDebug"
    
    # 1. Cleanup
    try:
        print(f"Cleaning up user {phone}...")
        User.objects.filter(phone=phone).delete()
        User.objects.filter(username=username).delete()
    except Exception as e:
        print(f"Cleanup warning: {e}")

    # 2. Simulate Signup Logic
    print("Attempting to create User with role='TEACHER'...")
    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                phone=phone,
                password=password,
                role='TEACHER' # THIS MUST MATCH EXACTLY WHAT SIGNAL EXPECTS
            )
            print(f"User created: {user} (ID: {user.id}, Role: {user.role})")
            
            # 3. Verify Signal Execution
            try:
                profile = TutorProfile.objects.get(user=user)
                print(f"✅ TutorProfile created successfully: {profile}")
            except TutorProfile.DoesNotExist:
                print("❌ ERROR: TutorProfile was NOT created by signal!")
                
            try:
                status = TutorStatus.objects.get(tutor__user=user)
                print(f"✅ TutorStatus created successfully: {status}")
            except TutorStatus.DoesNotExist:
                print("❌ ERROR: TutorStatus was NOT created by signal!")

    except Exception:
        print("\n!!! CRASH DURING CREATION !!!")
        traceback.print_exc()

if __name__ == "__main__":
    debug_create_tutor()
