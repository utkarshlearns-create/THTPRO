from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete users with short phone numbers (invalid data)'

    def handle(self, *args, **options):
        self.stdout.write("Checking for users with short usernames (likely invalid phone numbers)...")
        
        count_deleted = 0
        for u in User.objects.filter(role='TEACHER'):
            if len(u.username) < 10:
                self.stdout.write(f"Deleting user {u.username} (Short Username)")
                u.delete()
                count_deleted += 1
        
        self.stdout.write(self.style.SUCCESS(f"Deleted {count_deleted} users with invalid phone numbers."))
