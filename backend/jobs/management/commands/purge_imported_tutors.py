import os
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Safely purge previously imported tutors and re-run the bulk import script'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_files', nargs='+', type=str,
            help='Path(s) to CSV file(s) to import after purging.'
        )
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Simulate the purge and import without writing to the database.'
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Skip the confirmation prompt before deleting.'
        )
        parser.add_argument(
            '--report', type=str, default='reimport_report.csv',
            help='Path to write a CSV report of import results (optional).'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        csv_files = options['csv_files']
        report = options['report']

        self.stdout.write(self.style.WARNING("\n=== STEP 1: PURGE IMPORTED TUTORS ==="))
        
        # Determine target users: ROLE=TEACHER, not staff, not superuser.
        users_to_purge = User.objects.filter(
            role=User.Role.TEACHER,
            is_staff=False,
            is_superuser=False
        )
        
        count = users_to_purge.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No imported tutors found to purge."))
        else:
            self.stdout.write(self.style.WARNING(f"Found {count} users matching the purge criteria (role='TEACHER', not staff, not superuser)."))
            
            if not dry_run and not force:
                confirm = input("⚠️ Are you sure you want to delete these tutors? This will CASCADE and delete their profiles, status, and KYC records. This action cannot be undone. (yes/no): ")
                if confirm.lower() not in ['y', 'yes', 'yeah']:
                    self.stdout.write(self.style.ERROR("Purge aborted by user."))
                    return
                    
            if dry_run:
                self.stdout.write(self.style.SUCCESS(f"✅ [DRY RUN] Would delete {count} 'TEACHER' users."))
            else:
                try:
                    # Execute deletion
                    deleted_count, deleted_details = users_to_purge.delete()
                    deleted_user_count = deleted_details.get(User._meta.label, 0)
                    self.stdout.write(self.style.SUCCESS(f"✅ Successfully deleted {deleted_user_count} User objects (Total items dropped across cascade: {deleted_count})."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Failed to purge users: {e}"))
                    return

        self.stdout.write("\n" + self.style.WARNING("=== STEP 2: RE-IMPORT TUTORS ==="))
        
        # Check files exist
        for f in csv_files:
            if not os.path.exists(f):
                self.stdout.write(self.style.ERROR(f"❌ Error: CSV file not found at {f}"))
                return

        import_kwargs = {
            'status': 'ACTIVE',
            'report': report,
        }
        if dry_run:
            import_kwargs['dry_run'] = True
            
        try:
            self.stdout.write(self.style.SUCCESS(f"🚀 Calling import_tutors with {len(csv_files)} files..."))
            call_command('import_tutors', *csv_files, **import_kwargs)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error invoking import_tutors command: {e}"))
