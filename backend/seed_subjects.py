import os
import django
import sys

# Set up Django environment properly from within backend/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thtpro.settings')
django.setup()

from jobs.models import Subject

def seed_subjects():
    subjects_to_add = [
        "Mathematics", "Physics", "Chemistry", "Biology", "Science", 
        "English", "Hindi", "Sanskrit", "Regional Languages",
        "Social Science", "History", "Geography", "Civics", "Political Science", 
        "Computer Science", "Information Technology", "Coding",
        "Accountancy", "Business Studies", "Economics", "Commerce",
        "EVS (Environmental Studies)", "Psychology", "Sociology", "Physical Education"
    ]
    
    print(f"Adding/Updating {len(subjects_to_add)} subjects...")
    added_count = 0
    for subject_name in subjects_to_add:
        obj, created = Subject.objects.get_or_create(name=subject_name)
        if created:
            added_count += 1
            
    print(f"Successfully added {added_count} new subjects!")
    print(f"Total subjects in database: {Subject.objects.count()}")

if __name__ == '__main__':
    seed_subjects()
