"""
Utility functions for job posting workflow
"""
from django.contrib.auth import get_user_model
from core.roles import COUNSELLOR, SUPERADMIN, TUTOR_ADMIN
from django.db.models import Count, Q, CharField
from django.db.models.functions import Cast
from django.utils import timezone
import random
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

# Centralized Subject Synonyms for both Job and Tutor search
SUBJECT_SYNONYMS = {
    'Mathematics': ['Mathematics', 'Maths', 'Math', 'mathematics', 'maths', 'math'],
    'Physics': ['Physics', 'physics'],
    'Chemistry': ['Chemistry', 'chemistry'],
    'Biology': ['Biology', 'biology', 'Bio'],
    'Science': ['Science', 'science', 'General Science'],
    'English': ['English', 'english', 'English Language', 'English Literature'],
    'Hindi': ['Hindi', 'hindi'],
    'Sanskrit': ['Sanskrit', 'sanskrit'],
    'Social Science': ['Social Science', 'SST', 'Social Studies', 'social science'],
    'History': ['History', 'history'],
    'Geography': ['Geography', 'geography'],
    'Civics': ['Civics', 'civics', 'Civic'],
    'Political Science': ['Political Science', 'Pol Science', 'pol science'],
    'Computer Science': ['Computer Science', 'Computer', 'Computers', 'CS', 'computer science', 'computer'],
    'Information Technology': ['Information Technology', 'IT', 'information technology'],
    'Coding': ['Coding', 'coding', 'Programming'],
    'Accountancy': ['Accountancy', 'Accounts', 'accountancy', 'accounts', 'Accounting'],
    'Business Studies': ['Business Studies', 'business studies', 'Business'],
    'Economics': ['Economics', 'economics', 'Eco'],
    'Commerce': ['Commerce', 'commerce'],
    'EVS (Environmental Studies)': ['EVS', 'Environmental Studies', 'Environmental Science', 'evs'],
    'Psychology': ['Psychology', 'psychology'],
    'Sociology': ['Sociology', 'sociology'],
    'Physical Education': ['Physical Education', 'physical education', 'PE'],
    'Regional Languages': ['Regional Languages'],
}

def filter_by_subject(queryset, subject_name, field_name='subjects'):
    """
    Apply robust subject filtering to a queryset.
    Handles:
    1. JSON list field (using Cast to CharField)
    2. Case-insensitive partial matching (icontains)
    3. Synonyms (e.g. Maths -> Mathematics)
    4. "All Subjects" catch-all
    """
    if not subject_name:
        return queryset

    # Get synonyms if they exist
    synonyms = SUBJECT_SYNONYMS.get(subject_name, [subject_name])
    
    # Cast the JSON field to CharField if it hasn't been annotated yet
    field_str = f"{field_name}_str"
    if not hasattr(queryset, 'query') or field_str not in str(queryset.query):
        queryset = queryset.annotate(**{field_str: Cast(field_name, CharField())})
    
    # Build OR query for all synonyms + "All Subjects"
    # Also include tutors with no subject data populated (empty lists/nulls) if searching
    subject_q = Q(**{f"{field_str}__icontains": "All Subjects"})
    
    for syn in synonyms:
        subject_q |= Q(**{f"{field_str}__icontains": syn})
        
    return queryset.filter(subject_q)



def assign_job_to_admin(job_post):
    """
    Assigns a job post to the admin with the least workload OR the previously assigned admin.
    Uses AdminProfile for availability and department tracking.
    """
    from .admin_models import AdminTask, AdminProfile
    from .models import JobPost
    from users.models import Enquiry
    
    # 1. Check for Sticky Counsellor (Prioritize same admin for same parent)
    parent_user = job_post.parent or job_post.posted_by
    if parent_user:
        # Check prior jobs
        prior_job = JobPost.objects.filter(
            Q(parent=parent_user) | Q(posted_by=parent_user),
            assigned_admin__isnull=False
        ).exclude(id=job_post.id).order_by('-created_at').first()
        
        if prior_job and prior_job.assigned_admin.is_active:
            assigned_admin = prior_job.assigned_admin
            logger.info(f"Sticky Assignment: Re-assigning job {job_post.id} to previous admin {assigned_admin.username}")
            
            # Update counter for the sticky admin
            try:
                profile = AdminProfile.objects.get(user=assigned_admin)
                profile.pending_job_count += 1
                profile.save()
            except AdminProfile.DoesNotExist:
                pass
                
            return _finalize_job_assignment(job_post, assigned_admin)
            
        # Check prior enquiries linked by phone if parent has phone
        if hasattr(parent_user, 'phone') and parent_user.phone:
            prior_enquiry = Enquiry.objects.filter(
                phone=parent_user.phone,
                assigned_admin__isnull=False
            ).order_by('-created_at').first()
            
            if prior_enquiry and prior_enquiry.assigned_admin.is_active:
                assigned_admin = prior_enquiry.assigned_admin
                logger.info(f"Sticky Assignment: Job {job_post.id} assigned to admin {assigned_admin.username} based on prior Enquiry")
                
                try:
                    profile = AdminProfile.objects.get(user=assigned_admin)
                    profile.pending_job_count += 1
                    profile.save()
                except AdminProfile.DoesNotExist:
                    pass
                    
                return _finalize_job_assignment(job_post, assigned_admin)
                
    # 2. Fallback to Workload Balanced Assignment
    
    # Get active COUNSELLOR or SUPERADMIN admins who are available
    admin_profiles = AdminProfile.objects.filter(
        Q(department='COUNSELLOR') | Q(department='SUPERADMIN'),
        is_available=True,
        user__is_active=True
    ).order_by('pending_job_count')
    
    if not admin_profiles.exists():
        # Fallback to any active admin if no specific ops are available
        logger.warning("No COUNSELLOR admins available. Falling back to any admin.")
        admins = User.objects.filter(role__in=['COUNSELLOR', 'TUTOR_ADMIN'], is_active=True)
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
    
    return _finalize_job_assignment(job_post, assigned_admin)

def _finalize_job_assignment(job_post, assigned_admin):
    """Helper method to construct tasks and notifications for job assignments"""
    from .admin_models import AdminTask
    
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
    Assign KYC verification to the TUTOR_ADMIN or SUPERADMIN with the
    least workload.  COUNSELLORs are never eligible for KYC tasks.
    Never raises. Always sets status to UNDER_REVIEW.
    Returns admin user or None.
    """
    from .admin_models import AdminTask, AdminProfile
    from users.models import TutorKYC

    logger.info("assign_kyc_to_admin: KYC id=%s tutor=%s",
        kyc_record.id, kyc_record.tutor.user.username)

    assigned_admin = None

    # Try 1: Use AdminProfile for workload-balanced assignment
    #         Filter strictly by role (TUTOR_ADMIN / SUPERADMIN)
    try:
        admin_profiles = AdminProfile.objects.filter(
            user__role__in=[TUTOR_ADMIN, SUPERADMIN],
            is_available=True,
            user__is_active=True
        ).order_by('pending_kyc_count')

        logger.info("TUTOR_ADMIN/SUPERADMIN admin profiles found: %s", admin_profiles.count())

        if admin_profiles.exists():
            min_count = admin_profiles.first().pending_kyc_count
            candidates = list(admin_profiles.filter(pending_kyc_count=min_count))
            chosen_profile = random.choice(candidates)
            assigned_admin = chosen_profile.user
            chosen_profile.pending_kyc_count += 1
            chosen_profile.save()
    except Exception as e:
        logger.warning("AdminProfile lookup failed: %s", e)

    # Try 2: Fallback – any active TUTOR_ADMIN or SUPERADMIN user
    if not assigned_admin:
        try:
            admins = list(User.objects.filter(
                role__in=[TUTOR_ADMIN, SUPERADMIN],
                is_active=True
            ))
            logger.info("Fallback admins found: %s — %s",
                len(admins), [(a.username, a.role) for a in admins])
            if admins:
                assigned_admin = random.choice(admins)
        except Exception as e:
            logger.warning("Fallback admin lookup failed: %s", e)

    # Always set UNDER_REVIEW regardless of assignment success
    try:
        kyc_record.status = TutorKYC.Status.UNDER_REVIEW
        kyc_record.assigned_at = timezone.now()
        if assigned_admin:
            kyc_record.assigned_admin = assigned_admin
        kyc_record.save()
        logger.info("KYC %s → UNDER_REVIEW, assigned_admin=%s",
            kyc_record.id, assigned_admin.username if assigned_admin else 'unassigned')
    except Exception as e:
        logger.error("Failed to update KYC record %s: %s", kyc_record.id, e)

    # Create AdminTask and notify if admin found
    if assigned_admin:
        try:
            AdminTask.objects.get_or_create(
                admin=assigned_admin,
                related_kyc=kyc_record,
                defaults={
                    'task_type': 'KYC_VERIFICATION',
                    'status': 'PENDING',
                    'notes': f"KYC for {kyc_record.tutor.full_name or kyc_record.tutor.user.username}"
                }
            )
            send_notification(
                user=assigned_admin,
                title="New KYC Verification Request",
                message=f"KYC assigned: {kyc_record.tutor.full_name or kyc_record.tutor.user.username}",
                notification_type='KYC_ASSIGNED',
                related_kyc=kyc_record
            )
        except Exception as e:
            logger.warning("AdminTask/notification failed: %s", e)

    return assigned_admin


def assign_enquiry_to_admin(enquiry):
    """
    Assigns a Landing Page Enquiry to a Counsellor.
    Checks for Sticky Assignments based on phone number first.
    """
    from users.models import Enquiry, User
    from .models import JobPost
    from django.db.models import Q
    import random
    
    if not enquiry.phone:
        return _fallback_enquiry_assignment(enquiry)
        
    # 1. Check if an active User exists with this phone who has prior Jobs
    matching_user = User.objects.filter(phone=enquiry.phone).first()
    if matching_user:
        prior_job = JobPost.objects.filter(
            Q(parent=matching_user) | Q(posted_by=matching_user),
            assigned_admin__isnull=False
        ).order_by('-created_at').first()
        
        if prior_job and prior_job.assigned_admin.is_active:
            logger.info(f"Sticky Enquiry: Assigning to {prior_job.assigned_admin.username} based on prior Job")
            enquiry.assigned_admin = prior_job.assigned_admin
            enquiry.save()
            return enquiry.assigned_admin

    # 2. Check for prior Enquiries with same phone
    prior_enquiry = Enquiry.objects.filter(
        phone=enquiry.phone,
        assigned_admin__isnull=False
    ).exclude(id=enquiry.id).order_by('-created_at').first()
    
    if prior_enquiry and prior_enquiry.assigned_admin.is_active:
        logger.info(f"Sticky Enquiry: Assigning to {prior_enquiry.assigned_admin.username} based on prior Enquiry")
        enquiry.assigned_admin = prior_enquiry.assigned_admin
        enquiry.save()
        return enquiry.assigned_admin

    # 3. Fallback to Workload Balanced Assignment
    return _fallback_enquiry_assignment(enquiry)

def _fallback_enquiry_assignment(enquiry):
    from .admin_models import AdminProfile
    from users.models import User
    import random
    
    # Get active COUNSELLOR or SUPERADMIN
    admin_profiles = AdminProfile.objects.filter(
        Q(department='COUNSELLOR') | Q(department='SUPERADMIN'),
        is_available=True,
        user__is_active=True
    ).order_by('pending_job_count')
    
    if not admin_profiles.exists():
        admins = User.objects.filter(role__in=['COUNSELLOR', 'TUTOR_ADMIN'], is_active=True)
        if not admins.exists():
            return None
        assigned_admin = random.choice(admins)
    else:
        min_count = admin_profiles.first().pending_job_count
        candidates = admin_profiles.filter(pending_job_count=min_count)
        chosen_profile = random.choice(candidates)
        assigned_admin = chosen_profile.user
        
    enquiry.assigned_admin = assigned_admin
    enquiry.save()
    logger.info(f"Assigned Enquiry {enquiry.id} to admin {assigned_admin.username}")
    return assigned_admin
