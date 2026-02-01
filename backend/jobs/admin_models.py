from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class AdminTask(models.Model):
    """Tracks tasks assigned to admins"""
    TASK_TYPE_CHOICES = (
        ('JOB_APPROVAL', 'Job Approval'),
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50)  # 'JOB_ASSIGNED', 'JOB_APPROVED', etc.
    related_job = models.ForeignKey('JobPost', null=True, blank=True, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
