"""
Enquiry views: public contact form and admin management.
"""
from rest_framework import generics, permissions

from .models import Enquiry
from .serializers import EnquirySerializer
from core.permissions import IsAdminRole


class EnquiryCreateView(generics.CreateAPIView):
    """Public endpoint for 'Contact Us' form."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = EnquirySerializer

    def perform_create(self, serializer):
        from jobs.utils import assign_enquiry_to_admin
        enquiry = serializer.save()
        assign_enquiry_to_admin(enquiry)


class AdminEnquiryListView(generics.ListAPIView):
    """Admin view for enquiries."""
    permission_classes = [IsAdminRole]
    serializer_class = EnquirySerializer

    def get_queryset(self):
        return Enquiry.objects.all().order_by('-created_at')


class AdminEnquiryUpdateView(generics.UpdateAPIView):
    """Admin view to update enquiry status."""
    permission_classes = [IsAdminRole]
    serializer_class = EnquirySerializer

    def get_queryset(self):
        return Enquiry.objects.all()
