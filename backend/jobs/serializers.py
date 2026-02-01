from rest_framework import serializers
from .models import JobPost
from .admin_models import AdminTask, Notification


class JobPostSerializer(serializers.ModelSerializer):
    posted_by_username = serializers.CharField(source='posted_by.username', read_only=True)
    assigned_admin_username = serializers.CharField(source='assigned_admin.username', read_only=True)
    
    class Meta:
        model = JobPost
        fields = '__all__'
        read_only_fields = ('posted_by', 'assigned_admin', 'created_at', 'updated_at')


class TutorJobPostSerializer(serializers.ModelSerializer):
    """Serializer for tutors creating job opportunities"""
    class Meta:
        model = JobPost
        fields = [
            'class_grade', 'board', 'subjects', 'locality',
            'preferred_time', 'budget_range', 'hourly_rate', 'requirements'
        ]


class AdminTaskSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    job_details = JobPostSerializer(source='job_post', read_only=True)
    
    class Meta:
        model = AdminTask
        fields = '__all__'
        read_only_fields = ('admin', 'assigned_at', 'completed_at')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class NotificationSerializer(serializers.ModelSerializer):
    from .admin_models import Notification
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
        read_only_fields = ['parent', 'status', 'created_at']
