"""
Institution-related views: profile and tutor browsing.
"""
from rest_framework import generics, permissions
from django.db.models import Q, CharField
from django.db.models.functions import Cast

from .models import TutorProfile, InstitutionProfile
from .serializers import TutorProfileSerializer, InstitutionProfileSerializer


class InstitutionProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's institution profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InstitutionProfileSerializer

    def get_object(self):
        if self.request.user.role != 'INSTITUTION':
            raise permissions.PermissionDenied("User is not an institution.")
        profile, created = InstitutionProfile.objects.get_or_create(user=self.request.user)
        return profile


class InstitutionTutorListView(generics.ListAPIView):
    """List active tutors for institutions to browse."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TutorProfileSerializer

    def get_queryset(self):
        queryset = TutorProfile.objects.filter(
            status_record__status='ACTIVE'
        ).select_related('user', 'status_record')

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.annotate(
                subjects_str=Cast('subjects', CharField())
            ).filter(
                Q(user__first_name__icontains=q) |
                Q(subjects_str__icontains=q)
            )

        return queryset.order_by('-profile_completion_percentage', '-teaching_experience_years')
