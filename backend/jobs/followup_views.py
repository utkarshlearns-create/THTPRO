from rest_framework import serializers, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from core.permissions import IsAdminRole
from .followup_models import FollowUp


class FollowUpSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = FollowUp
        fields = [
            'id', 'created_by', 'created_by_name',
            'assigned_to', 'assigned_to_name',
            'lead_name', 'lead_phone', 'lead_email', 'lead_type',
            'related_job', 'title', 'note',
            'priority', 'status', 'scheduled_at',
            'reminder_sent', 'completed_at', 'completion_note',
            'created_at', 'updated_at', 'is_overdue',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'reminder_sent']

    def get_created_by_name(self, obj):
        return obj.created_by.first_name or obj.created_by.username

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.first_name or obj.assigned_to.username
        return None

    def get_is_overdue(self, obj):
        if obj.status == 'PENDING' and obj.scheduled_at < timezone.now():
            return True
        return False


class FollowUpListCreateView(APIView):
    """List all follow-ups for the admin or create a new one."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        qs = FollowUp.objects.select_related('created_by', 'assigned_to')

        # Filter by status
        f_status = request.query_params.get('status')
        if f_status:
            qs = qs.filter(status=f_status)

        # Filter by priority
        priority = request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)

        # Filter by lead type
        lead_type = request.query_params.get('lead_type')
        if lead_type:
            qs = qs.filter(lead_type=lead_type)

        # Filter by assigned admin
        assigned = request.query_params.get('assigned_to')
        if assigned == 'me':
            qs = qs.filter(assigned_to=request.user)
        elif assigned:
            qs = qs.filter(assigned_to_id=assigned)

        # Filter overdue
        overdue = request.query_params.get('overdue')
        if overdue == 'true':
            qs = qs.filter(status='PENDING', scheduled_at__lt=timezone.now())

        # Search
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(lead_name__icontains=search) |
                Q(lead_phone__icontains=search) |
                Q(note__icontains=search)
            )

        # Order: overdue first, then by scheduled_at
        qs = qs.order_by(
            # Pending first
            'status',
            'scheduled_at',
        )

        serializer = FollowUpSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FollowUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        followup = serializer.save(
            created_by=request.user,
            assigned_to=serializer.validated_data.get('assigned_to') or request.user,
        )
        return Response(FollowUpSerializer(followup).data, status=status.HTTP_201_CREATED)


class FollowUpDetailView(APIView):
    """Get, update, or delete a specific follow-up."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_object(self, pk):
        try:
            return FollowUp.objects.select_related('created_by', 'assigned_to').get(pk=pk)
        except FollowUp.DoesNotExist:
            return None

    def get(self, request, pk):
        followup = self.get_object(pk)
        if not followup:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FollowUpSerializer(followup).data)

    def patch(self, request, pk):
        followup = self.get_object(pk)
        if not followup:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FollowUpSerializer(followup, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # If marking as completed, set completed_at
        if request.data.get('status') == 'COMPLETED' and followup.status != 'COMPLETED':
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()

        return Response(FollowUpSerializer(followup).data)

    def delete(self, request, pk):
        followup = self.get_object(pk)
        if not followup:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        followup.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FollowUpStatsView(APIView):
    """Dashboard stats for follow-ups."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        now = timezone.now()
        qs = FollowUp.objects.all()

        # Today's follow-ups
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        stats = {
            'total_pending': qs.filter(status='PENDING').count(),
            'overdue': qs.filter(status='PENDING', scheduled_at__lt=now).count(),
            'today': qs.filter(
                status='PENDING',
                scheduled_at__gte=today_start,
                scheduled_at__lte=today_end,
            ).count(),
            'completed_this_week': qs.filter(
                status='COMPLETED',
                completed_at__gte=now - timezone.timedelta(days=7),
            ).count(),
        }
        return Response(stats)


class FollowUpDueView(APIView):
    """Get follow-ups that are due now or overdue (for notification polling)."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        now = timezone.now()
        due = FollowUp.objects.filter(
            status='PENDING',
            scheduled_at__lte=now,
            reminder_sent=False,
        ).select_related('created_by', 'assigned_to')

        # Optionally filter by assigned admin
        if request.query_params.get('mine') == 'true':
            due = due.filter(assigned_to=request.user)

        serializer = FollowUpSerializer(due, many=True)

        # Mark them as reminder_sent
        due.update(reminder_sent=True)

        return Response(serializer.data)
