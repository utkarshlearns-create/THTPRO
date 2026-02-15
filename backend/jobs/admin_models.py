from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class AdminProfile(models.Model):
    """Profile for admins to track workload and department"""
    DEPARTMENT_CHOICES = (
        ('PARENT_OPS', 'Parent Operations'), # Handles Job Approvals
        ('TUTOR_OPS', 'Tutor Operations'),   # Handles KYC
        ('INSTITUTION_OPS', 'Institution Operations'), # Handles Institutions
        ('SUPERADMIN', 'Super Admin'),       # Access to all
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='SUPERADMIN')
    
    # Workload counters
    pending_job_count = models.PositiveIntegerField(default=0)
    pending_kyc_count = models.PositiveIntegerField(default=0)
    
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_department_display()}"


class AdminTask(models.Model):
    """Tracks tasks assigned to admins"""
    TASK_TYPE_CHOICES = (
        ('JOB_APPROVAL', 'Job Approval'),
        ('KYC_VERIFICATION', 'KYC Verification'),  # NEW
        ('TUTOR_VERIFICATION', 'Tutor Verification'),
        ('DISPUTE_RESOLUTION', 'Dispute Resolution'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_tasks')
    task_type = models.CharField(max_length=30, choices=TASK_TYPE_CHOICES)
    job_post = models.ForeignKey('JobPost', null=True, blank=True, on_delete=models.CASCADE)
    
    # NEW: Support for KYC verification tasks
    related_kyc = models.ForeignKey(
        'users.TutorKYC',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='admin_tasks'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.task_type} - {self.admin.username} - {self.status}"


class Notification(models.Model):
    """In-app notifications for users"""
    
    NOTIFICATION_TYPE_CHOICES = (
        # Job-related
        ('JOB_ASSIGNED', 'Job Assigned to Admin'),
        ('JOB_APPROVED', 'Job Approved'),
        ('JOB_REJECTED', 'Job Rejected'),
        ('JOB_MODIFICATIONS_NEEDED', 'Job Modifications Needed'),
        
        # KYC-related (NEW)
        ('KYC_ASSIGNED', 'KYC Assigned to Admin'),
        ('KYC_APPROVED', 'KYC Approved'),
        ('KYC_REJECTED', 'KYC Rejected'),
        ('KYC_RESUBMIT', 'KYC Re-submission Required'),
        
        # General
        ('SYSTEM', 'System Notification'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    related_job = models.ForeignKey('JobPost', null=True, blank=True, on_delete=models.CASCADE)
    
    # NEW: Support for KYC notifications
    related_kyc = models.ForeignKey(
        'users.TutorKYC',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
