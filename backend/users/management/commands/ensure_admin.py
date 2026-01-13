from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Creates a superuser if none exists'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from env or use defaults (change these!)
        phone = os.environ.get('SUPERUSER_PHONE', '9876543210')
        password = os.environ.get('SUPERUSER_PASSWORD', 'admin12345')
        
        if not User.objects.filter(phone=phone).exists():
            print(f"Creating superuser {phone}...")
            User.objects.create_superuser(
                phone=phone,
                password=password,
                username="Super Admin",
                role='ADMIN'
            )
            print("Superuser created successfully!")
        else:
            print(f"Superuser {phone} already exists.")
