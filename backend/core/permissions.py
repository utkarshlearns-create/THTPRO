"""Custom DRF permission classes for role-based authorization."""

from rest_framework.permissions import BasePermission

from .roles import ADMIN_ROLES


class IsAdminRole(BasePermission):
    """Allow access only to authenticated users with an admin role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ADMIN_ROLES
        )
