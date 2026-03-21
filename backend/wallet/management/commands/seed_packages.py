"""Seed subscription packages for Parents and Teachers."""

from django.core.management.base import BaseCommand

from wallet.models import SubscriptionPackage


PACKAGES = [
    {
        'name': 'Parent Starter',
        'price': 599,
        'credit_amount': 5,
        'target_role': 'PARENT',
        'features': [
            '5 Contact Unlock Credits',
            'Valid forever',
            'Instant activation',
        ],
    },
    {
        'name': 'Parent Pro',
        'price': 999,
        'credit_amount': 10,
        'target_role': 'PARENT',
        'features': [
            '10 Contact Unlock Credits',
            'Valid forever',
            'Instant activation',
            'Best value',
        ],
    },
    {
        'name': 'Teacher Shield',
        'price': 599,
        'credit_amount': 3,
        'target_role': 'TEACHER',
        'features': [
            '3 Rejection Credits (Lives)',
            'Apply to unlimited jobs',
            'Valid forever',
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed default subscription packages for Parents and Teachers.'

    def handle(self, *args, **options):
        created = 0
        for pkg_data in PACKAGES:
            _, was_created = SubscriptionPackage.objects.get_or_create(
                name=pkg_data['name'],
                defaults=pkg_data,
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {pkg_data['name']}"))
            else:
                self.stdout.write(f"  Already exists: {pkg_data['name']}")
        self.stdout.write(self.style.SUCCESS(f'\nDone. {created} new package(s) created.'))
