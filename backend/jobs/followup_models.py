from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FollowUp(models.Model):
    """Follow-up reminders for admin/counsellor to track leads and tasks"""

    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    LEAD_TYPE_CHOICES = (
        ('PARENT', 'Parent Lead'),
        ('TUTOR', 'Tutor Lead'),
        ('INSTITUTION', 'Institution Lead'),
        ('GENERAL', 'General'),
    )

    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_followups'
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='assigned_followups',
        null=True, blank=True,
        help_text='Admin assigned to this follow-up. Defaults to creator.'
    )

    # Lead info
    lead_name = models.CharField(max_length=200)
    lead_phone = models.CharField(max_length=20, blank=True)
    lead_email = models.CharField(max_length=200, blank=True)
    lead_type = models.CharField(max_length=20, choices=LEAD_TYPE_CHOICES, default='GENERAL')

    # Optional link to existing job
    related_job = models.ForeignKey(
        'JobPost', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='followups'
    )

    # Follow-up details
    title = models.CharField(max_length=255)
    note = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Scheduling
    scheduled_at = models.DateTimeField(
        help_text='When the follow-up reminder should trigger'
    )
    reminder_sent = models.BooleanField(default=False)

    completed_at = models.DateTimeField(null=True, blank=True)
    completion_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.title} - {self.lead_name} ({self.get_status_display()})"
