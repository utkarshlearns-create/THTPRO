from rest_framework import generics, permissions
from .models import JobPost
from .serializers import JobPostSerializer

class JobPostListCreateView(generics.ListCreateAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Parents see their own jobs
        if self.request.user.role == 'PARENT':
            return JobPost.objects.filter(parent=self.request.user).order_by('-created_at')
        # Tutors see ALL OPEN jobs (for "Find Jobs" feature later)
        elif self.request.user.role == 'TEACHER':
            return JobPost.objects.filter(status='OPEN').order_by('-created_at')
        # Admins see all
        elif self.request.user.role == 'ADMIN':
            return JobPost.objects.all().order_by('-created_at')
        return JobPost.objects.none()

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

class JobPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Add custom permission check in get_object or permission_classes if needed

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Application

class ParentDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'PARENT':
            return Response({"error": "Not a parent"}, status=403)
        
        # 1. Total Jobs Posted
        jobs = JobPost.objects.filter(parent=user)
        total_jobs = jobs.count()
        
        # 2. Total Applications Received (across all jobs)
        total_applications = Application.objects.filter(job__parent=user).count()
        
        # 3. Currently Assigned Tutor (Any hired application?)
        # We look for any application with status 'HIRED'
        hired_app = Application.objects.filter(job__parent=user, status='HIRED').last()
        assigned_tutor_name = "None"
        if hired_app:
            assigned_tutor_name = hired_app.tutor.user.username # Or full_name if available
            
        return Response({
            "jobs_posted": total_jobs,
            "applications_received": total_applications,
            "assigned_tutor": assigned_tutor_name
        })
