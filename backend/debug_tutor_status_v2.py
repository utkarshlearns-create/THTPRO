
import os
import django
import sys

# Setup Django environment correctly
# Add the project root to sys.path
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # This assumes 'backend' is the project name in settings?? No, 'THTPRO.settings' probably?
# Let's check manage.py to be sure what settings module is used.
# But usually in this structure it is 'backend.settings' OR 'THTPRO.settings'
# Checking previous manage.py content would reveal it. 
# Assuming 'backend.settings' based on folder structure, but if it fails, try 'THTPRO.settings'

# Actually, the user's manage.py is in c:\Users\brahm\THTPRO\backend\manage.py
# So if running from c:\Users\brahm\THTPRO, we need to add 'backend' to path?
# OR we should run FROM backend folder.

# Let's try this:
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') 

try:
    django.setup()
except Exception as e:
    # Fallback
    print(f"Setup failed: {e}")
    sys.path.pop()
    sys.path.append(os.getcwd())
    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
    django.setup()

from users.models import TutorProfile, TutorStatus
from django.db.models import Count

def debug_tutors():
    print("--- Testing Search Logic ---")
    
    # 1. Test Subject Search
    subject = "Maths"
    # Note: SQLite JSON lookup might behave differently than Postgres. 
    # But icontains on JSONField acts on the TEXT representation in Django usually.
    math_tutors = TutorProfile.objects.filter(status_record__status='ACTIVE', subjects__icontains=subject)
    print(f"Tutors with '{subject}': {math_tutors.count()}")
    
    # 2. Test Class Search (using subjects field as per fix)
    grade = "10th"
    grade_tutors = TutorProfile.objects.filter(
        status_record__status='ACTIVE', 
        subjects__icontains=grade
    )
    print(f"Tutors with '{grade}' (in subjects): {grade_tutors.count()}")
    
    # 3. Test Locality Search
    locality = "Lucknow" # Most common likely
    loc_tutors = TutorProfile.objects.filter(status_record__status='ACTIVE', locality__icontains=locality)
    print(f"Tutors in '{locality}': {loc_tutors.count()}")
    
    # 4. Show a sample of subjects to see exact format
    print("\nSample Subjects List:")
    for t in TutorProfile.objects.filter(status_record__status='ACTIVE')[:5]:
        print(t.subjects)

if __name__ == '__main__':
    debug_tutors()
