from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        PARENT = 'PARENT', 'Parent'
        TEACHER = 'TEACHER', 'Teacher'
        ADMIN = 'ADMIN', 'Admin'
        SUPERADMIN = 'SUPERADMIN', 'Super Admin'
        INSTITUTION = 'INSTITUTION', 'Institution'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PARENT)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    # We will use phone/email for auth eventually, but for now stick to default username/password 
    # or simple customization.
    

    def __str__(self):
        return self.username

class TutorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    
    # Personal Info
    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    MARITAL_STATUS_CHOICES = [('Single', 'Single'), ('Married', 'Married')]
    TEACHING_MODE_CHOICES = [('HOME', 'Home'), ('ONLINE', 'Online'), ('BOTH', 'Both')]
    
    full_name = models.CharField(max_length=150, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    marital_status = models.CharField(max_length=10, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    whatsapp_number = models.CharField(max_length=15, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    about_me = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='tutor_profiles/', blank=True, null=True)
    
    # Location & Mode
    locality = models.CharField(max_length=200, blank=True, null=True)
    teaching_mode = models.CharField(max_length=10, choices=TEACHING_MODE_CHOICES, default='BOTH')
    
    # Address
    local_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)
    
    # Professional Details
    highest_qualification = models.CharField(max_length=100, blank=True, null=True)
    teaching_experience_years = models.PositiveIntegerField(default=0)
    teaching_experience_school_years = models.PositiveIntegerField(default=0) # Kept for legacy compatibility
    expected_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # JSON Fields for flexibility
    subjects = models.JSONField(default=list, blank=True) # e.g. ["Maths", "Science"]
    classes = models.JSONField(default=list, blank=True)  # e.g. ["Class 10", "Class 12"]
    
    # Qualification Details (Intermediate)
    intermediate_stream = models.CharField(max_length=100, blank=True, null=True)
    intermediate_school = models.CharField(max_length=200, blank=True, null=True)
    intermediate_year = models.PositiveIntegerField(blank=True, null=True)
    intermediate_board = models.CharField(max_length=100, blank=True, null=True)

    # Qualification Details (Highest)
    highest_stream = models.CharField(max_length=100, blank=True, null=True)
    highest_year = models.PositiveIntegerField(blank=True, null=True)
    highest_university = models.CharField(max_length=200, blank=True, null=True)
    highest_college = models.CharField(max_length=200, blank=True, null=True)
    
    # Certifications
    is_bed = models.BooleanField(default=False)
    is_tet = models.BooleanField(default=False)
    is_mphil = models.BooleanField(default=False)
    is_phd = models.BooleanField(default=False)
    other_certifications = models.TextField(blank=True, null=True)
    
    # Document Uploads (Legacy fields kept for compatibility, new ones in KYC)
    resume = models.FileField(upload_to='tutor_docs/', blank=True, null=True)
    intro_video = models.FileField(upload_to='tutor_videos/', blank=True, null=True)
    
    profile_completion_percentage = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Profile of {self.user.username}"


class TutorKYC(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        SUBMITTED = 'SUBMITTED', 'Submitted'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='kyc_records')
    
    # Required Documents
    aadhaar_document = models.ImageField(upload_to='kyc_docs/', blank=True, null=True)
    education_certificate = models.FileField(upload_to='kyc_docs/', blank=True, null=True)
    photo = models.ImageField(upload_to='kyc_docs/', blank=True, null=True)
    
    # Additional Documents (NEW)
    pan_document = models.ImageField(upload_to='kyc_docs/', blank=True, null=True)
    passport_document = models.ImageField(upload_to='kyc_docs/', blank=True, null=True)
    police_verification = models.FileField(upload_to='kyc_docs/', blank=True, null=True)
    teaching_certificate = models.FileField(upload_to='kyc_docs/', blank=True, null=True)
    
    # Document Verification Flags (NEW)
    aadhaar_verified = models.BooleanField(default=False)
    education_verified = models.BooleanField(default=False)
    photo_verified = models.BooleanField(default=False)
    pan_verified = models.BooleanField(default=False)
    
    # Re-submission Tracking (NEW)
    documents_to_resubmit = models.JSONField(default=list, blank=True)  # ['aadhaar', 'pan', etc.]
    admin_feedback = models.TextField(blank=True, null=True)
    
    # Admin Assignment (NEW)
    assigned_admin = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_kyc_verifications'
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Existing Fields
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    rejection_reason = models.TextField(blank=True, null=True)
    submission_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"KYC for {self.tutor.user.username} - {self.status}"

class TutorStatus(models.Model):
    class State(models.TextChoices):
        SIGNED_UP = 'SIGNED_UP', 'Signed Up'
        PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE', 'Profile Incomplete'
        KYC_SUBMITTED = 'KYC_SUBMITTED', 'KYC Submitted'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        APPROVED = 'APPROVED', 'Approved'
        ACTIVE = 'ACTIVE', 'Active'
        REJECTED = 'REJECTED', 'Rejected'
        FROZEN = 'FROZEN', 'Frozen (Max Attempts Exceeded)'

    tutor = models.OneToOneField(TutorProfile, on_delete=models.CASCADE, related_name='status_record')
    status = models.CharField(max_length=20, choices=State.choices, default=State.SIGNED_UP)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.tutor.user.username}: {self.status}"

class ContactUnlock(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='unlocked_contacts')
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='unlocked_by')
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('parent', 'tutor')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.parent.username} unlocked {self.tutor.user.username}"


class Enquiry(models.Model):
    """General contact/support enquiries"""
    STATUS_CHOICES = (
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    )
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.subject} - {self.name}"

class InstitutionProfile(models.Model):
    """Profile for Institution users (Schools, Coaching Centers)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='institution_profile')
    institution_name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    contact_person = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.institution_name
