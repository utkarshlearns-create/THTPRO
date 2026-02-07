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


class SuperAdminAnalyticsView(APIView):
    """
    Superadmin: Get comprehensive analytics for dashboard.
    Returns KPIs, charts data, and stats.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from django.utils import timezone
        from django.db.models import Count, Sum
        from django.db.models.functions import TruncMonth, TruncWeek
        from datetime import timedelta
        from jobs.models import JobPost, Application
        from wallet.models import Transaction, Wallet
        from users.models import TutorProfile, TutorKYC

        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

        # === KPI Metrics ===
        total_leads = JobPost.objects.count()
        fresh_leads = JobPost.objects.filter(created_at__gte=this_month_start).count()
        rejected_leads = JobPost.objects.filter(status='REJECTED').count()
        confirmed_tuitions = Application.objects.filter(status='HIRED').count()
        
        # Revenue from wallet credits (deposits)
        total_revenue = Transaction.objects.filter(
            transaction_type='CREDIT'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Follow-ups: Pending jobs needing attention
        pending_jobs = JobPost.objects.filter(status='PENDING_APPROVAL').count()
        
        # User counts
        total_parents = User.objects.filter(role='PARENT').count()
        total_tutors = User.objects.filter(role='TUTOR').count()
        total_admins = User.objects.filter(role='ADMIN').count()
        
        # KYC stats
        pending_kyc = TutorKYC.objects.filter(status='SUBMITTED').count()
        verified_kyc = TutorKYC.objects.filter(status='APPROVED').count()

        # === Chart Data: Leads vs Conversions (Last 6 months) ===
        six_months_ago = now - timedelta(days=180)
        leads_by_month = JobPost.objects.filter(
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            leads=Count('id')
        ).order_by('month')

        conversions_by_month = Application.objects.filter(
            status='HIRED',
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            conversions=Count('id')
        ).order_by('month')

        # Merge leads and conversions data
        leads_dict = {item['month'].strftime('%b'): item['leads'] for item in leads_by_month}
        conversions_dict = {item['month'].strftime('%b'): item['conversions'] for item in conversions_by_month}
        
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        current_month_idx = now.month - 1
        last_6_months = [months[(current_month_idx - i) % 12] for i in range(5, -1, -1)]
        
        leads_vs_conversions = [
            {
                "name": month,
                "Leads": leads_dict.get(month, 0),
                "Conversions": conversions_dict.get(month, 0)
            }
            for month in last_6_months
        ]

        # === Pie Chart: Lead Distribution ===
        lead_distribution = [
            {"name": "Fresh", "value": fresh_leads, "color": "#10b981"},
            {"name": "Pending", "value": pending_jobs, "color": "#f59e0b"},
            {"name": "Approved", "value": JobPost.objects.filter(status='APPROVED').count(), "color": "#3b82f6"},
            {"name": "Rejected", "value": rejected_leads, "color": "#ef4444"},
        ]

        # === Line Chart: Weekly Revenue (Last 4 weeks) ===
        four_weeks_ago = now - timedelta(weeks=4)
        revenue_by_week = Transaction.objects.filter(
            transaction_type='CREDIT',
            created_at__gte=four_weeks_ago
        ).annotate(
            week=TruncWeek('created_at')
        ).values('week').annotate(
            revenue=Sum('amount')
        ).order_by('week')

        revenue_weekly = [
            {"name": f"Week {i+1}", "Revenue": 0}
            for i in range(4)
        ]
        for idx, item in enumerate(revenue_by_week):
            if idx < 4:
                revenue_weekly[idx]["Revenue"] = float(item['revenue'] or 0)

        return Response({
            # KPIs
            "total_leads": total_leads,
            "fresh_leads": fresh_leads,
            "rejected_leads": rejected_leads,
            "confirmed_tuitions": confirmed_tuitions,
            "total_revenue": float(total_revenue),
            "pending_jobs": pending_jobs,
            
            # User stats
            "total_parents": total_parents,
            "total_tutors": total_tutors,
            "total_admins": total_admins,
            "pending_kyc": pending_kyc,
            "verified_kyc": verified_kyc,
            
            # Chart data
            "leads_vs_conversions": leads_vs_conversions,
            "lead_distribution": lead_distribution,
            "revenue_weekly": revenue_weekly,
        })

