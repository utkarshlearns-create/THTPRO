from django.contrib import admin
from .models import JobPost, Application
from .admin_models import AdminTask, Notification

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'class_grade', 'locality', 'posted_by', 'assigned_admin', 'status', 'created_at')
    list_filter = ('status', 'board', 'created_at')
    search_fields = ('locality', 'class_grade', 'subjects')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'tutor', 'status', 'created_at')
    list_filter = ('status', 'created_at')

@admin.register(AdminTask)
class AdminTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin', 'task_type', 'job_post', 'status', 'assigned_at')
    list_filter = ('task_type', 'status', 'assigned_at')
    readonly_fields = ('assigned_at', 'completed_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    readonly_fields = ('created_at',)
