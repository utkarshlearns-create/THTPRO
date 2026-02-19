from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete dummy tutors created by import script'

    def handle(self, *args, **options):
        # Identify dummy users by a specific pattern or just by the fact they were created recently 
        # For safety, since our dummy script used phone numbers starting with 9 and 'Tutor@123' password...
        # actually, the safest way is to delete users whose phone number is in the dummy CSV. 
        # But we don't want to parse that again. 
        
        # Let's delete users with role='TEACHER' and joined recently (today) 
        # OR simply by checking if their email matches the dummy pattern (firstname.lastnameXX@example.com)
        
        self.stdout.write("Deleting dummy tutors...")
        
        # Pattern match for dummy emails
        dummy_users = User.objects.filter(role='TEACHER', email__endswith='@example.com')
        
        count = dummy_users.count()
        if count == 0:
             self.stdout.write("No dummy tutors found to delete.")
             return

        self.stdout.write(f"Found {count} dummy tutors. Deleting...")
        
        # Delete
        dummy_users.delete()
        
        self.stdout.write(self.style.SUCCESS(f"Successfully deleted {count} dummy tutors."))
