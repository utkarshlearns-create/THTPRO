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
from users.admin_views import IsSuperAdmin

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
    permission_classes = [IsSuperAdmin]
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = JobPost.objects.all().order_by('-created_at')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
        
        # Filter by assigned admin
        admin_id = self.request.query_params.get('admin_id')
        if admin_id:
            if admin_id == 'unassigned':
                queryset = queryset.filter(assigned_admin__isnull=True)
            else:
                queryset = queryset.filter(assigned_admin_id=admin_id)
        
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
        all_jobs = JobPost.objects.all()
        response.data['stats'] = {
            'total': all_jobs.count(),
            'pending': all_jobs.filter(status='PENDING_APPROVAL').count(),
            'approved': all_jobs.filter(status='APPROVED').count(),
            'rejected': all_jobs.filter(status='REJECTED').count(),
            'assigned': all_jobs.filter(status='ASSIGNED').count(),
            'closed': all_jobs.filter(status='CLOSED').count(),
        }
        
        return response


class CRMJobDetailView(generics.RetrieveAPIView):
    """
    Superadmin CRM: Get full job details including applications.
    """
    serializer_class = JobPostSerializer
    permission_classes = [IsSuperAdmin]
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
                admin = User.objects.get(pk=admin_id, role='ADMIN')
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
    permission_classes = [IsSuperAdmin]

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
        admins = User.objects.filter(role='ADMIN', is_active=True)
        return Response([
            {
                'id': admin.id,
                'name': admin.username,
                'email': admin.email,
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

        jobs = JobPost.objects.all()
        
        return Response({
            # Pipeline stages
            'pipeline': {
                'pending': jobs.filter(status='PENDING_APPROVAL').count(),
                'approved': jobs.filter(status='APPROVED').count(),
                'assigned': jobs.filter(status='ASSIGNED').count(),
                'closed': jobs.filter(status='CLOSED').count(),
                'rejected': jobs.filter(status='REJECTED').count(),
            },
            # Time-based metrics
            'today': jobs.filter(created_at__date=today).count(),
            'this_week': jobs.filter(created_at__date__gte=this_week).count(),
            'this_month': jobs.filter(created_at__date__gte=this_month).count(),
            # Conversion metrics
            'total_applications': Application.objects.count(),
            'hired_applications': Application.objects.filter(status='HIRED').count(),
            'conversion_rate': round(
                (Application.objects.filter(status='HIRED').count() / max(Application.objects.count(), 1)) * 100, 
                1
            ),
            # Unassigned jobs needing attention
            'unassigned_pending': jobs.filter(status='PENDING_APPROVAL', assigned_admin__isnull=True).count(),
        })
