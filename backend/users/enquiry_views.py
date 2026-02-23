"""
Enquiry views: public contact form and admin management.
"""
from rest_framework import generics, permissions

from .models import Enquiry
from .serializers import EnquirySerializer


class EnquiryCreateView(generics.CreateAPIView):
    """Public endpoint for 'Contact Us' form."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = EnquirySerializer


class AdminEnquiryListView(generics.ListAPIView):
    """Admin view for enquiries."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = EnquirySerializer

    def get_queryset(self):
        return Enquiry.objects.all().order_by('-created_at')


class AdminEnquiryUpdateView(generics.UpdateAPIView):
    """Admin view to update enquiry status."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = EnquirySerializer

    def get_queryset(self):
        return Enquiry.objects.all()
