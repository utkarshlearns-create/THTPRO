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
    Uses AdminProfile for availability and department tracking.
    """
    from .admin_models import AdminTask, AdminProfile
    
    # Get active PARENT_OPS or SUPERADMIN admins who are available
    admin_profiles = AdminProfile.objects.filter(
        Q(department='PARENT_OPS') | Q(department='SUPERADMIN'),
        is_available=True,
        user__is_active=True
    ).order_by('pending_job_count')
    
    if not admin_profiles.exists():
        # Fallback to any active admin if no specific ops are available
        logger.warning("No PARENT_OPS admins available. Falling back to any admin.")
        admins = User.objects.filter(role='ADMIN', is_active=True)
        if not admins.exists():
            logger.error("No active admins available for job assignment")
            raise Exception("No active admins available")
        assigned_admin = random.choice(admins)
    else:
        # Pick the one with least job count
        # (Already sorted by pending_job_count asc)
        min_count = admin_profiles.first().pending_job_count
        candidates = admin_profiles.filter(pending_job_count=min_count)
        chosen_profile = random.choice(candidates)
        assigned_admin = chosen_profile.user
        
        # Increment counter
        chosen_profile.pending_job_count += 1
        chosen_profile.save()
    
    logger.info(f"Assigning job {job_post.id} to admin {assigned_admin.username}")
    
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


def send_notification(user, title, message, notification_type, related_job=None, related_kyc=None):
    """
    Create in-app notification for a user
    
    Args:
        user: User to notify
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        related_job: Optional related JobPost
        related_kyc: Optional related TutorKYC (NEW)
    """
    from .admin_models import Notification
    
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_job=related_job,
        related_kyc=related_kyc  # NEW
    )
    
    logger.info(f"Notification created for {user.username}: {title}")
    return notification


def assign_kyc_to_admin(kyc_record):
    """
    Assign KYC verification to admin with least total workload.
    Uses AdminProfile for availability and department tracking.
    """
    from .admin_models import AdminTask, AdminProfile
    from users.models import TutorKYC
    
    # Get active TUTOR_OPS or SUPERADMIN admins
    admin_profiles = AdminProfile.objects.filter(
        Q(department='TUTOR_OPS') | Q(department='SUPERADMIN'),
        is_available=True,
        user__is_active=True
    ).order_by('pending_kyc_count')
    
    if not admin_profiles.exists():
        logger.warning("No TUTOR_OPS admins available. Falling back to any admin.")
        admins = User.objects.filter(role='ADMIN', is_active=True)
        if not admins.exists():
             logger.error("No active admins available for KYC assignment")
             raise Exception("No active admins available")
        assigned_admin = random.choice(admins)
    else:
        # Pick least loaded
        min_count = admin_profiles.first().pending_kyc_count
        candidates = admin_profiles.filter(pending_kyc_count=min_count)
        chosen_profile = random.choice(candidates)
        assigned_admin = chosen_profile.user
        
        # Increment counter
        chosen_profile.pending_kyc_count += 1
        chosen_profile.save()
    
    logger.info(f"Assigning KYC {kyc_record.id} to admin {assigned_admin.username}")
    
    # Update KYC record
    kyc_record.assigned_admin = assigned_admin
    kyc_record.assigned_at = timezone.now()
    kyc_record.status = TutorKYC.Status.UNDER_REVIEW
    kyc_record.save()
    
    # Create AdminTask
    AdminTask.objects.create(
        admin=assigned_admin,
        task_type='KYC_VERIFICATION',
        related_kyc=kyc_record,
        status='PENDING',
        notes=f"KYC verification for {kyc_record.tutor.user.username}"
    )
    
    # Send notification to admin
    send_notification(
        user=assigned_admin,
        title="New KYC Verification Request",
        message=f"KYC verification assigned for tutor: {kyc_record.tutor.full_name or kyc_record.tutor.user.username}",
        notification_type='KYC_ASSIGNED',
        related_kyc=kyc_record
    )
    
    return assigned_admin
