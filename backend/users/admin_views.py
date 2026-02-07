from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import UserAdminSerializer

User = get_user_model()

class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to superusers or users with role='SUPERADMIN'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPERADMIN')

class UserManagementView(generics.ListAPIView):
    """
    Superadmin: List all users with filtering and search.
    """
    serializer_class = UserAdminSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Search (Name, Email, Phone)
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(
                Q(username__icontains=q) | 
                Q(email__icontains=q) |
                Q(phone__icontains=q)
            )
        
        # Filter by Role
        role = self.request.query_params.get('role', None)
        if role and role != 'ALL':
            queryset = queryset.filter(role=role)
            
        # Filter by Status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            if status_param == 'active':
                queryset = queryset.filter(is_active=True)
            elif status_param == 'inactive':
                queryset = queryset.filter(is_active=False)
                
        return queryset

class UserStatusView(APIView):
    """
    Superadmin: Toggle user active status (Ban/Unban).
    """
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Prevent banning yourself
            if user == request.user:
                 return Response({"error": "You cannot deactivate your own account."}, status=400)
            
            # Toggle status
            user.is_active = not user.is_active
            user.save()
            
            status_msg = "activated" if user.is_active else "deactivated"
            return Response({"message": f"User {user.username} has been {status_msg}.", "is_active": user.is_active})
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
