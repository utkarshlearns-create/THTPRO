import os
import django
import sys
import dj_database_url

# Hardcode the URL the user confirmed is correct
db_url = "postgresql://neondb_owner:npg_Dwk3aUNrIK5f@ep-cool-dew-ainh9q-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Override the database setting BEFORE django.setup() by injecting it into environ
os.environ['DATABASE_URL'] = db_url

django.setup()

from jobs.models import Subject

try:
    count = Subject.objects.count()
    print(f"Connection Successful! Database Subject Count: {count}")
    
    # Since we're here and connected, let's just seed them right now if not fully seeded!
    subjects_to_add = [
        "Mathematics", "Physics", "Chemistry", "Biology", "Science", 
        "English", "Hindi", "Sanskrit", "Regional Languages",
        "Social Science", "History", "Geography", "Civics", "Political Science", 
        "Computer Science", "Information Technology", "Coding",
        "Accountancy", "Business Studies", "Economics", "Commerce",
        "EVS (Environmental Studies)", "Psychology", "Sociology", "Physical Education"
    ]
    added = 0
    for s in subjects_to_add:
        _, c = Subject.objects.get_or_create(name=s)
        if c: added += 1
    
    print(f"Seeded {added} new subjects. Total subjects now: {Subject.objects.count()}")
    
except Exception as e:
    print(f"Connection Failed: {e}")
