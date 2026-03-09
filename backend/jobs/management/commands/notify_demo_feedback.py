"""
Management command: notify_demo_feedback

Finds completed demos where 1 hour has passed since the tutor marked
the demo as completed, and sends a notification to the parent asking
for their review and whether they want to finalize the tutor.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from jobs.models import Application
from jobs.utils import send_notification

import logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send delayed feedback notifications to parents after demo completion (1 hour delay).'

    def handle(self, *args, **options):
        one_hour_ago = timezone.now() - timedelta(hours=1)

        # Find applications where:
        # - demo is COMPLETED
        # - demo was completed more than 1 hour ago
        # - parent has NOT been notified yet
        # - tutor is NOT yet confirmed (hired)
        pending_reviews = Application.objects.filter(
            demo_status='COMPLETED',
            demo_completed_at__isnull=False,
            demo_completed_at__lte=one_hour_ago,
            parent_notified_for_review=False,
            is_confirmed=False,
        ).select_related('job', 'tutor')

        count = 0
        for app in pending_reviews:
            job = app.job
            parent_user = job.parent or job.posted_by

            if not parent_user:
                logger.warning(f"Application {app.id}: No parent user found, skipping.")
                continue

            tutor_name = app.tutor.full_name if app.tutor else 'Your tutor'

            send_notification(
                user=parent_user,
                title='How was the demo? Share your feedback!',
                message=(
                    f"{tutor_name} completed a demo for {job.class_grade} ({job.subjects}). "
                    f"Please review the demo and let us know if you'd like to finalize this tutor "
                    f"or request a different one. Visit your dashboard to take action."
                ),
                notification_type='SYSTEM',
                related_job=job,
            )

            app.parent_notified_for_review = True
            app.save(update_fields=['parent_notified_for_review'])
            count += 1
            logger.info(f"Sent feedback notification for application {app.id} to {parent_user.username}")

        self.stdout.write(self.style.SUCCESS(f'Successfully sent {count} feedback notification(s).'))
