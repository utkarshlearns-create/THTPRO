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
    student_gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female')], blank=True)
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

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    # We use 'users.TutorProfile' as string to avoid circular imports if possible,
    # or import it carefully. But generally User is fine if we check role, 
    # but linking to TutorProfile is better for data integrity. 
    # Let's import TutorProfile safely or use string.
    tutor = models.ForeignKey('users.TutorProfile', on_delete=models.CASCADE, related_name='applications')
    
    cover_message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'tutor') # One application per job per tutor

    def __str__(self):
        return f"App by {self.tutor.user.username} for {self.job.student_name}"

# Import additional models
from .admin_models import AdminTask, Notification, AdminProfile
