"""
CRM Module Views for Superadmin
Handles job pipeline, lead management, and admin assignment
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from .models import JobPost, Application
from .serializers import JobPostSerializer
from users.admin_views import IsSuperAdmin, IsAdminOrSuperAdmin

User = get_user_model()


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CRMJobListView(generics.ListAPIView):
    """
    Superadmin CRM: List all jobs with advanced filters.
    Supports filtering by status, date range, location, assigned admin.
    """
    serializer_class = JobPostSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = JobPost.objects.all().order_by('-created_at')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
        
        # Filter by assigned admin ID
        admin_id = self.request.query_params.get('admin_id')
        if admin_id:
            if admin_id == 'unassigned':
                queryset = queryset.filter(assigned_admin__isnull=True)
            else:
                queryset = queryset.filter(assigned_admin_id=admin_id)

        # Filter by assigned admin role
        admin_role = self.request.query_params.get('admin_role')
        if admin_role:
            if admin_role == 'unassigned':
                queryset = queryset.filter(assigned_admin__isnull=True)
            else:
                queryset = queryset.filter(assigned_admin__role=admin_role)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Filter by location
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(locality__icontains=location)
        
        # Search by student name or subjects
        search = self.request.query_params.get('q')
        if search:
            queryset = queryset.filter(
                Q(student_name__icontains=search) |
                Q(locality__icontains=search) |
                Q(class_grade__icontains=search)
            )
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Add summary stats
        # ⚡ Bolt: Use a single aggregate query instead of 6 separate counts
        # This reduces DB queries from 6 to 1, significantly improving list response time
        stats = JobPost.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='PENDING_APPROVAL')),
            approved=Count('id', filter=Q(status='APPROVED')),
            rejected=Count('id', filter=Q(status='REJECTED')),
            assigned=Count('id', filter=Q(status='ASSIGNED')),
            closed=Count('id', filter=Q(status='CLOSED')),
        )

        response.data['stats'] = stats
        
        return response


class CRMJobDetailView(generics.RetrieveAPIView):
    """
    Superadmin CRM: Get full job details including applications.
    """
    serializer_class = JobPostSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    queryset = JobPost.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add applications data
        applications = Application.objects.filter(job=instance)
        data['applications'] = [
            {
                'id': app.id,
                'tutor_name': app.tutor.user.username,
                'tutor_id': app.tutor.id,
                'status': app.status,
                'created_at': app.created_at,
                'cover_message': app.cover_message
            }
            for app in applications
        ]
        
        # Add parent info if available
        if instance.parent:
            data['parent_info'] = {
                'id': instance.parent.id,
                'name': instance.parent.username,
                'phone': instance.parent.phone,
                'email': instance.parent.email
            }
        
        # Add posted_by (tutor) info if available
        if instance.posted_by:
            data['posted_by_info'] = {
                'id': instance.posted_by.id,
                'name': instance.posted_by.username,
                'phone': instance.posted_by.phone
            }
        
        return Response(data)


class CRMAssignAdminView(APIView):
    """
    Superadmin CRM: Assign a job to an admin for follow-up.
    """
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            job = JobPost.objects.get(pk=pk)
            admin_id = request.data.get('admin_id')
            
            if admin_id:
                admin = User.objects.get(pk=admin_id, role__in=['COUNSELLOR', 'TUTOR_ADMIN'])
                job.assigned_admin = admin
                job.save()
                return Response({
                    'message': f'Job assigned to {admin.username}',
                    'assigned_admin': {
                        'id': admin.id,
                        'name': admin.username
                    }
                })
            else:
                # Unassign
                job.assigned_admin = None
                job.save()
                return Response({'message': 'Job unassigned'})
                
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Admin not found'}, status=404)


class CRMUpdateStatusView(APIView):
    """
    Superadmin CRM: Update job status.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def patch(self, request, pk):
        try:
            job = JobPost.objects.get(pk=pk)
            new_status = request.data.get('status')
            
            valid_statuses = [s[0] for s in JobPost.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return Response({'error': f'Invalid status. Must be one of: {valid_statuses}'}, status=400)
            
            old_status = job.status
            job.status = new_status
            
            # Optionally add notes
            notes = request.data.get('notes')
            if notes:
                if new_status == 'REJECTED':
                    job.rejection_reason = notes
                elif new_status == 'MODIFICATIONS_NEEDED':
                    job.modification_feedback = notes
            
            job.save()
            
            return Response({
                'message': f'Status updated from {old_status} to {new_status}',
                'job_id': job.id,
                'new_status': new_status
            })
                
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)


class CRMAdminListView(APIView):
    """
    Get list of admins for assignment dropdown.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        admins = User.objects.filter(role__in=['COUNSELLOR', 'TUTOR_ADMIN'], is_active=True)
        return Response([
            {
                'id': admin.id,
                'name': admin.username,
                'email': admin.email,
                'role': admin.role,
                'assigned_jobs': JobPost.objects.filter(assigned_admin=admin).count()
            }
            for admin in admins
        ])


class CRMPipelineStatsView(APIView):
    """
    Get pipeline statistics for the CRM dashboard.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        today = now.date()
        this_week = today - timedelta(days=7)
        this_month = today - timedelta(days=30)

        # ⚡ Bolt: Optimize pipeline stats by using aggregate queries
        # Reduces JobPost queries from 9 to 1, and Application queries from 3 to 1
        job_stats = JobPost.objects.aggregate(
            pending=Count('id', filter=Q(status='PENDING_APPROVAL')),
            approved=Count('id', filter=Q(status='APPROVED')),
            assigned=Count('id', filter=Q(status='ASSIGNED')),
            closed=Count('id', filter=Q(status='CLOSED')),
            rejected=Count('id', filter=Q(status='REJECTED')),
            today=Count('id', filter=Q(created_at__date=today)),
            this_week=Count('id', filter=Q(created_at__date__gte=this_week)),
            this_month=Count('id', filter=Q(created_at__date__gte=this_month)),
            unassigned_pending=Count('id', filter=Q(status='PENDING_APPROVAL', assigned_admin__isnull=True)),
        )

        app_stats = Application.objects.aggregate(
            total=Count('id'),
            hired=Count('id', filter=Q(status='HIRED'))
        )

        total_apps = app_stats['total']
        hired_apps = app_stats['hired']
        
        return Response({
            # Pipeline stages
            'pipeline': {
                'pending': job_stats['pending'],
                'approved': job_stats['approved'],
                'assigned': job_stats['assigned'],
                'closed': job_stats['closed'],
                'rejected': job_stats['rejected'],
            },
            # Time-based metrics
            'today': job_stats['today'],
            'this_week': job_stats['this_week'],
            'this_month': job_stats['this_month'],
            # Conversion metrics
            'total_applications': total_apps,
            'hired_applications': hired_apps,
            'conversion_rate': round(
                (hired_apps / max(total_apps, 1)) * 100,
                1
            ),
            # Unassigned jobs needing attention
            'unassigned_pending': job_stats['unassigned_pending'],
        })


class AdminApplicationListView(generics.ListAPIView):
    """
    List all job applications for Admin/Superadmin.
    """
    from .serializers import ApplicationSerializer
    serializer_class = ApplicationSerializer
    permission_classes = [IsSuperAdmin] # Or IsAdminUser
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = Application.objects.all().select_related('tutor', 'job').order_by('-created_at')
        
        # Filter by Status
        status = self.request.query_params.get('status')
        if status and status != 'ALL':
            queryset = queryset.filter(status=status)
            
        # Search (Tutor Name, Job Title)
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(tutor__user__username__icontains=q) |
                Q(tutor__user__email__icontains=q) |
                Q(job__class_grade__icontains=q) |
                Q(job__subjects__icontains=q)
            )
            
        return queryset
