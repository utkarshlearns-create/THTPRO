from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class JobPost(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('ASSIGNED', 'Assigned'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    )

    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_posts')
    student_name = models.CharField(max_length=100)
    student_gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female')])
    class_grade = models.CharField(max_length=50) # e.g. "Class 10"
    board = models.CharField(max_length=50) # e.g. "CBSE", "ICSE"
    subjects = models.JSONField(default=list) # ["Maths", "Physics"]
    
    locality = models.CharField(max_length=255)
    preferred_time = models.CharField(max_length=100, blank=True)
    budget_range = models.CharField(max_length=100, blank=True)
    
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
