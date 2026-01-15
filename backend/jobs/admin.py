from django.contrib import admin
from .models import JobPost

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'class_grade', 'board', 'locality', 'status', 'created_at']
    list_filter = ['status', 'board', 'class_grade']
    search_fields = ['student_name', 'locality', 'parent__phone']
