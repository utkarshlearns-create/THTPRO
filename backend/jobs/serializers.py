from rest_framework import serializers
from .models import JobPost, Application
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


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for tutor job applications"""
    job_details = serializers.SerializerMethodField()
    tutor_name = serializers.CharField(source='tutor.full_name', read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_details', 'tutor', 'tutor_name', 'cover_message', 
                  'status', 'created_at', 'updated_at']
        read_only_fields = ('tutor', 'created_at', 'updated_at')
    
    def get_job_details(self, obj):
        """Return job details for the application"""
        job = obj.job
        return {
            'id': job.id,
            'title': f"{'/'.join(job.subjects)} Tutor for {job.class_grade}",
            'subjects': job.subjects,
            'class_grade': job.class_grade,
            'board': job.board,
            'locality': job.locality,
            'budget_range': job.budget_range,
            'hourly_rate': str(job.hourly_rate) if job.hourly_rate else None,
            'requirements': job.requirements,
            'status': job.status,
            'student_name': job.student_name,
            'parent_name': job.parent.username if job.parent else "N/A",  
        }


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
