"""Ensure a bootstrap superadmin account exists in production."""

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Create or update a default superadmin account from environment variables."""

    help = 'Creates a superadmin if none exists and ensures Django admin access flags'

    def handle(self, *args, **options):
        user_model = get_user_model()

        phone = os.environ.get('SUPERUSER_PHONE', '9876543210')
        password = os.environ.get('SUPERUSER_PASSWORD', 'admin12345')
        username = os.environ.get('SUPERUSER_USERNAME', 'superadmin')

        user, created = user_model.objects.get_or_create(
            phone=phone,
            defaults={
                'username': username,
                'role': 'SUPERADMIN',
                'is_superuser': True,
                'is_staff': True,
            },
        )

        if created:
            user.set_password(password)
            user.save(update_fields=['password'])
            self.stdout.write(self.style.SUCCESS(f'Created superadmin {phone}.'))
            return

        updated = False
        if user.role != 'SUPERADMIN':
            user.role = 'SUPERADMIN'
            updated = True
        if not user.is_superuser:
            user.is_superuser = True
            updated = True
        if not user.is_staff:
            user.is_staff = True
            updated = True
        if updated:
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated superadmin flags for {phone}.'))
        else:
            self.stdout.write(f'Superadmin {phone} already configured.')
