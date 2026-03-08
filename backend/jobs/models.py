from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class JobPost(models.Model):
    STATUS_CHOICES = (
        ('PENDING_APPROVAL', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('MODIFICATIONS_NEEDED', 'Modifications Needed'),
        ('ACTIVE', 'Active'),
        ('ASSIGNED', 'Assigned'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    )

    # For backward compatibility - parent can be null for tutor-posted jobs
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_posts', null=True, blank=True)
    
    # New field: Tutor who posted the job opportunity
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tutor_job_posts', null=True, blank=True)
    
    # Admin assignment
    assigned_admin = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='assigned_jobs', null=True, blank=True)
    
    # Job details
    student_name = models.CharField(max_length=100, blank=True)  # Optional for tutor posts
    student_gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Any', 'Any')], blank=True)
    tutor_gender_preference = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Any', 'Any')], default='Any')
    tuition_mode = models.CharField(max_length=20, choices=[('HOME', 'Home Tuition'), ('ONLINE_ONE_TO_ONE', 'Online One-to-One'), ('ONLINE_GROUP', 'Online Group'), ('INSTITUTION', 'Institution / Center'), ('BOTH', 'Both / Any')], default='HOME')
    class_grade = models.CharField(max_length=50) # e.g. "Class 10"
    board = models.CharField(max_length=50) # e.g. "CBSE", "ICSE"
    subjects = models.JSONField(default=list) # ["Maths", "Physics"]
    
    locality = models.CharField(max_length=255)
    preferred_time = models.CharField(max_length=100, blank=True)
    budget_range = models.CharField(max_length=100, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requirements = models.TextField(blank=True, null=True)
    
    # Admin feedback
    rejection_reason = models.TextField(blank=True, null=True)
    modification_feedback = models.TextField(blank=True, null=True)
    
    parent_whatsapp_number = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_name} ({self.class_grade}) - {self.locality}"

class Application(models.Model):
    STATUS_CHOICES = (
        ('APPLIED', 'Applied'),
        ('SHORTLISTED', 'Shortlisted'),
        ('HIRED', 'Hired'),
        ('REJECTED', 'Rejected'),
    )

    DEMO_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('RESCHEDULE_REQUESTED', 'Reschedule Requested'),
        ('COMPLETED', 'Completed'),
    )

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    # We use 'users.TutorProfile' as string to avoid circular imports if possible,
    # or import it carefully. But generally User is fine if we check role, 
    # but linking to TutorProfile is better for data integrity. 
    # Let's import TutorProfile safely or use string.
    tutor = models.ForeignKey('users.TutorProfile', on_delete=models.CASCADE, related_name='applications')
    
    cover_message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    demo_date = models.DateTimeField(null=True, blank=True)
    demo_status = models.CharField(max_length=30, choices=DEMO_STATUS_CHOICES, default='PENDING')
    demo_remarks = models.TextField(blank=True, null=True)
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'tutor') # One application per job per tutor

    def __str__(self):
        return f"App by {self.tutor.user.username} for {self.job.student_name}"

class TutorRating(models.Model):
    tutor = models.ForeignKey('users.TutorProfile', on_delete=models.CASCADE, related_name='ratings')
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings')
    job = models.ForeignKey(JobPost, on_delete=models.SET_NULL, null=True, blank=True, related_name='ratings')
    rating = models.IntegerField()
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tutor', 'parent', 'job')
        
    def __str__(self):
        return f"Rating for {self.tutor.user.username} by {self.parent.username}: {self.rating}/5"

class TutorAttendance(models.Model):
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('RESCHEDULED', 'Rescheduled'),
    )
    tutor = models.ForeignKey('users.TutorProfile', on_delete=models.CASCADE, related_name='attendance_records')
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')
    marked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marked_attendance')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tutor', 'job', 'date')

    def __str__(self):
        return f"{self.tutor.user.username} - {self.date} - {self.status}"

# ==================== MASTER DATA MODELS ====================

class Subject(models.Model):
    """Master list of subjects for dropdowns"""
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)  # e.g., lucide icon name
    category = models.CharField(max_length=50, default='Academic')  # Academic, Competitive, etc.
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Board(models.Model):
    """Education boards (CBSE, ICSE, State Boards, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    short_name = models.CharField(max_length=20, blank=True)  # e.g., "CBSE"
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class ClassLevel(models.Model):
    """Class levels (Class 1-12, Competitive exams, etc.)"""
    name = models.CharField(max_length=100, unique=True)  # e.g., "Class 10", "JEE Advanced"
    category = models.CharField(max_length=50, default='School')  # School, Competitive, Language
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Location(models.Model):
    """Locations/Cities for tuition services"""
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['city']
        unique_together = ('city', 'pincode')

    def __str__(self):
        return f"{self.city}" + (f" - {self.pincode}" if self.pincode else "")


class Locality(models.Model):
    """Specific areas/localities within a Location (City)"""
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='localities')
    name = models.CharField(max_length=200)
    pincode = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ('location', 'name')
        verbose_name_plural = 'Localities'

    def __str__(self):
        return f"{self.name}, {self.location.city}"


# Import additional models
from .admin_models import AdminTask, Notification, AdminProfile


class InstituteJob(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    )
    
    JOB_TYPE_CHOICES = (
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
        ('GUEST_LECTURE', 'Guest Lecture'),
    )

    institution = models.ForeignKey(User, on_delete=models.CASCADE, related_name='institute_jobs')
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=100)
    class_level = models.CharField(max_length=100) # e.g., "Class 11-12"
    requirements = models.TextField()
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='FULL_TIME')
    start_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} at {self.institution.institution_profile.institution_name if hasattr(self.institution, 'institution_profile') else self.institution.username}"
