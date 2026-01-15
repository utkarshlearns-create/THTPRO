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
