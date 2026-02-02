from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import TutorProfile, TutorStatus

User = get_user_model()

@receiver(post_save, sender=User)
def create_tutor_profile(sender, instance, created, **kwargs):
    """
    Auto-create TutorProfile and TutorStatus when a user signs up with role='TEACHER'
    """
    if created and instance.role == User.Role.TEACHER:
        profile = TutorProfile.objects.create(user=instance)
        TutorStatus.objects.create(tutor=profile, status=TutorStatus.State.SIGNED_UP)

@receiver(post_save, sender=TutorProfile)
def update_profile_completion(sender, instance, **kwargs):
    """
    Auto-calculate profile completion percentage.
    """
    # Prevent infinite loop if we are saving the percentage itself
    if kwargs.get('update_fields') and 'profile_completion_percentage' in kwargs['update_fields']:
        return

    fields_to_check = [
        # Personal Information (6 fields)
        'full_name', 'gender', 'dob', 'whatsapp_number', 'marital_status', 'about_me',
        # Address (3 fields)
        'local_address', 'permanent_address', 'locality',
        # Teaching Details (5 fields)
        'subjects', 'classes', 'teaching_mode', 'teaching_experience_years', 'expected_fee',
        # Education (4 fields)
        'highest_qualification', 'highest_stream', 'highest_university', 'intermediate_stream',
        # Note: intro_video is optional and not required for 100% completion
    ]
    
    completed = 0
    total = len(fields_to_check)
    
    for field in fields_to_check:
        value = getattr(instance, field)
        if value:
             # Check for empty lists in JSON fields
            if isinstance(value, list) and len(value) == 0:
                continue
            # Check for empty strings
            if isinstance(value, str) and value.strip() == '':
                continue
            completed += 1
            
    percentage = int((completed / total) * 100)
    
    if instance.profile_completion_percentage != percentage:
        instance.profile_completion_percentage = percentage
        # Update only the percentage field to avoid recursion
        instance.save(update_fields=['profile_completion_percentage'])

        # Update Status if profile is complete (and not yet submitted)
        try:
            status_obj = instance.status_record
            if percentage == 100 and status_obj.status == TutorStatus.State.SIGNED_UP:
                # We could auto-move to PROFILE_COMPLETE or keep it as SIGNED_UP until they click "Submit"
                pass 
        except TutorStatus.DoesNotExist:
            pass
