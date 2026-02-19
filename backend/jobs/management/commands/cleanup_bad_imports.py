from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import TutorProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete tutors with empty names from faulty import'

    def handle(self, *args, **options):
        self.stdout.write("Checking for tutors with empty full_name...")
        
        # Iterate and check
        count_deleted = 0
        for p in TutorProfile.objects.all():
            if not p.full_name or not p.full_name.strip():
                try:
                    u = p.user
                    self.stdout.write(f"Deleting user {u.username} (Empty Name)")
                    u.delete()
                    count_deleted += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error deleting profile {p.id}: {e}"))
        
        self.stdout.write(self.style.SUCCESS(f"Deleted {count_deleted} users."))
