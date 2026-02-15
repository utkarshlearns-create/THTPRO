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
        queryset = User.objects.all().select_related('admin_profile').order_by('-date_joined')
        
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


class UserUpdateView(APIView):
    """
    Superadmin: Update user details (username, email, phone, role, department).
    """
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # Prevent editing yourself to prevent lockouts
            if user == request.user and 'role' in request.data:
                if request.data['role'] != 'SUPERADMIN':
                    return Response({"error": "Cannot change your own role."}, status=400)
            
            # Update allowed fields
            allowed_fields = ['username', 'email', 'phone', 'role', 'department']
            for field in allowed_fields:
                if field in request.data:
                    setattr(user, field, request.data[field])
            
            user.save()
            
            return Response({
                "message": f"User {user.username} updated successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "phone": user.phone,
                    "role": user.role,
                    "department": getattr(user, 'department', None),
                    "is_active": user.is_active
                }
            })
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


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


class AdminPerformanceView(APIView):
    """
    Superadmin: Get performance metrics for Admin users.
    Can filter by department: PARENT_OPS or TUTOR_OPS
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from django.utils import timezone
        from django.db.models import Count, Q
        from datetime import timedelta
        from jobs.models import JobPost, Application
        from jobs.admin_models import AdminProfile
        from users.models import TutorKYC

        department = request.query_params.get('department')  # PARENT_OPS or TUTOR_OPS
        
        # Get admins by department through AdminProfile relationship
        admins_query = User.objects.filter(role='ADMIN', is_active=True).select_related('admin_profile')
        if department:
            admins_query = admins_query.filter(admin_profile__department=department)
        
        now = timezone.now()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_week = now - timedelta(days=7)
        
        admin_performance = []
        
        for admin in admins_query:
            # Get department from AdminProfile
            admin_dept = 'N/A'
            if hasattr(admin, 'admin_profile') and admin.admin_profile:
                admin_dept = admin.admin_profile.department
            
            # Calculate metrics
            metrics = {
                'id': admin.id,
                'username': admin.username,
                'email': admin.email,
                'department': admin_dept,
                'date_joined': admin.date_joined.isoformat(),
            }
            
            # === PARENT_OPS Metrics ===
            if not department or department == 'PARENT_OPS':
                assigned_jobs = JobPost.objects.filter(assigned_admin=admin)
                jobs_count = assigned_jobs.count()
                jobs_closed = assigned_jobs.filter(status__in=['CLOSED', 'ASSIGNED']).count() # jobs successfully assigned to tutor
                
                # Check applications on these jobs that resulted in HIRE
                hired_apps = Application.objects.filter(job__assigned_admin=admin, status='HIRED').count()
                
                metrics['jobs_assigned'] = jobs_count
                metrics['jobs_approved'] = assigned_jobs.filter(status='APPROVED').count()
                metrics['jobs_rejected'] = assigned_jobs.filter(status='REJECTED').count()
                metrics['jobs_pending'] = assigned_jobs.filter(status='PENDING_APPROVAL').count()
                metrics['jobs_this_month'] = assigned_jobs.filter(created_at__gte=this_month).count()
                metrics['jobs_converted'] = hired_apps
                
                # Conversion Rate (Hired / Assigned)
                metrics['conversion_rate'] = round((hired_apps / jobs_count * 100), 1) if jobs_count > 0 else 0

            # === TUTOR_OPS Metrics ===
            if not department or department == 'TUTOR_OPS':
                # Assuming verified_by is a field in TutorKYC (need to check model, if not, use logs or tasks)
                # If verified_by is not on TutorKYC, we might need to rely on AdminTask for this stats
                # For now using verified_by as assumed field or fallback to counting approved KYCs if we tracked them
                
                # Check if TutorKYC has 'verified_by' field. If not, we can't easily track individual perf unless we use AdminTask
                # Fallback to AdminTask if needed:
                # kyc_tasks = AdminTask.objects.filter(admin=admin, task_type='KYC_VERIFICATION', status='COMPLETED')
                
                # Let's assume we use AdminTask for more accuracy if verified_by is missing
                from jobs.admin_models import AdminTask
                kyc_tasks = AdminTask.objects.filter(admin=admin, task_type__in=['KYC_VERIFICATION', 'TUTOR_VERIFICATION'], status='COMPLETED')
                
                metrics['kyc_processed'] = kyc_tasks.count()
                metrics['kyc_this_month'] = kyc_tasks.filter(completed_at__gte=this_month).count()
                metrics['kyc_this_week'] = kyc_tasks.filter(completed_at__gte=this_week).count()
                
                # Simplified approval rate based on tasks logic (if we tracked decision in notes or status)
                # For now just showing volume
            
            admin_performance.append(metrics)
        
        # Identify Top Performers
        top_converter = None
        top_kpi_user = None
        
        if admin_performance:
            # Sort by conversion rate for Top Performer (Parent Ops)
            parent_ops_admins = [a for a in admin_performance if a.get('department') == 'PARENT_OPS']
            if parent_ops_admins:
                top_converter = max(parent_ops_admins, key=lambda x: x.get('conversion_rate', 0))

            # Sort by volume for Tutor Ops
            tutor_ops_admins = [a for a in admin_performance if a.get('department') == 'TUTOR_OPS']
            if tutor_ops_admins:
                top_kpi_user = max(tutor_ops_admins, key=lambda x: x.get('kyc_processed', 0))

        # Summary stats
        summary = {
            'total_admins': admins_query.count(),
            'department': department or 'ALL',
            'top_performer_parent_ops': top_converter,
            'top_performer_tutor_ops': top_kpi_user,
        }
        
        return Response({
            'summary': summary,
            'admins': admin_performance
        })
