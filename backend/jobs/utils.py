"""
Utility functions for job posting workflow
"""
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
import random
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


def assign_job_to_admin(job_post):
    """
    Assigns a job post to the admin with the least workload.
    Uses load balancing algorithm.
    Returns the assigned admin User object.
    """
    from .admin_models import AdminTask
    
    # Get all active admins
    admins = User.objects.filter(role='ADMIN', is_active=True)
    
    if not admins.exists():
        logger.error("No active admins available for job assignment")
        raise Exception("No active admins available")
    
    # Count pending tasks for each admin
    admin_workload = admins.annotate(
        pending_count=Count('admin_tasks', filter=Q(admin_tasks__status='PENDING'))
    ).order_by('pending_count')
    
    # Get admins with minimum workload
    min_workload = admin_workload.first().pending_count
    least_loaded_admins = [a for a in admin_workload if a.pending_count == min_workload]
    
    # If multiple admins have same workload, pick randomly (round-robin alternative)
    assigned_admin = random.choice(least_loaded_admins)
    
    logger.info(f"Assigning job {job_post.id} to admin {assigned_admin.username} (workload: {min_workload})")
    
    # Update job post
    job_post.assigned_admin = assigned_admin
    job_post.save()
    
    # Create AdminTask
    AdminTask.objects.create(
        admin=assigned_admin,
        task_type='JOB_APPROVAL',
        job_post=job_post,
        status='PENDING'
    )
    
    # Send notification
    send_notification(
        user=assigned_admin,
        title="New Job Approval Request",
        message=f"A new job posting requires your approval: {job_post.class_grade} {', '.join(job_post.subjects)} in {job_post.locality}",
        notification_type='JOB_ASSIGNED',
        related_job=job_post
    )
    
    return assigned_admin


def send_notification(user, title, message, notification_type, related_job=None):
    """
    Create in-app notification for a user
    """
    from .admin_models import Notification
    
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_job=related_job
    )
    
    logger.info(f"Notification created for {user.username}: {title}")
    return notification
