"""
Tutor-related views: profile, search, contact unlock, and dashboard stats.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, CharField
from django.db.models.functions import Cast

from .models import TutorProfile, TutorStatus, ContactUnlock
from .serializers import TutorProfileSerializer, PublicTutorProfileSerializer
from wallet.models import Wallet


class TutorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = TutorProfile.objects.get_or_create(user=self.request.user)
        return profile


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stats = {
            "total_applications": 0,
            "accepted_applications": 0,
        }
        return Response(stats)


class PublicTutorSearchView(generics.ListAPIView):
    """
    Public API for searching tutors.
    Allows filtering by Subject, Class, Locality, Mode.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PublicTutorProfileSerializer

    # Synonym map: frontend dropdown value → alternative spellings in DB
    SUBJECT_SYNONYMS = {
        'Mathematics': ['Mathematics', 'Maths', 'Math', 'mathematics', 'maths', 'math'],
        'Physics': ['Physics', 'physics'],
        'Chemistry': ['Chemistry', 'chemistry'],
        'Biology': ['Biology', 'biology', 'Bio'],
        'Science': ['Science', 'science', 'General Science'],
        'English': ['English', 'english', 'English Language', 'English Literature'],
        'Hindi': ['Hindi', 'hindi'],
        'Sanskrit': ['Sanskrit', 'sanskrit'],
        'Social Science': ['Social Science', 'SST', 'Social Studies', 'social science'],
        'History': ['History', 'history'],
        'Geography': ['Geography', 'geography'],
        'Civics': ['Civics', 'civics', 'Civic'],
        'Political Science': ['Political Science', 'Pol Science', 'pol science'],
        'Computer Science': ['Computer Science', 'Computer', 'Computers', 'CS', 'computer science', 'computer'],
        'Information Technology': ['Information Technology', 'IT', 'information technology'],
        'Coding': ['Coding', 'coding', 'Programming'],
        'Accountancy': ['Accountancy', 'Accounts', 'accountancy', 'accounts', 'Accounting'],
        'Business Studies': ['Business Studies', 'business studies', 'Business'],
        'Economics': ['Economics', 'economics', 'Eco'],
        'Commerce': ['Commerce', 'commerce'],
        'EVS (Environmental Studies)': ['EVS', 'Environmental Studies', 'Environmental Science', 'evs'],
        'Psychology': ['Psychology', 'psychology'],
        'Sociology': ['Sociology', 'sociology'],
        'Physical Education': ['Physical Education', 'physical education', 'PE'],
        'Regional Languages': ['Regional Languages'],
    }

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def get_queryset(self):
        queryset = TutorProfile.objects.filter(
            status_record__status='ACTIVE'
        ).select_related('user', 'status_record').annotate(
            subjects_str=Cast('subjects', CharField()),
            classes_str=Cast('classes', CharField()),
        ).order_by('-profile_completion_percentage', '-teaching_experience_years')

        params = self.request.query_params

        # 1. Text Search
        q = params.get('q')
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q) |
                Q(full_name__icontains=q) |
                Q(about_me__icontains=q) |
                Q(subjects_str__icontains=q)
            )

        # 2. Subject Filter — match synonyms, but also include tutors with no subject data
        subject = params.get('subject')
        if subject:
            synonyms = self.SUBJECT_SYNONYMS.get(subject, [subject])
            subject_q = Q(subjects_str__in=['[]', '""', 'null', '']) | Q(subjects_str__isnull=True)
            for syn in synonyms:
                subject_q |= Q(subjects_str__icontains=syn)
            queryset = queryset.filter(subject_q)

        # 3. Class/Grade Filter — also include tutors with no class data
        grade = params.get('class') or params.get('grade')
        if grade:
            queryset = queryset.filter(
                Q(classes_str__in=['[]', '""', 'null', '']) |
                Q(classes_str__isnull=True) |
                Q(classes_str__icontains=grade) |
                Q(subjects_str__icontains=grade)
            )

        # 4. Location Filters
        state = params.get('state')
        if state:
            queryset = queryset.filter(state__icontains=state)

        city = params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)

        locality = params.get('locality')
        if locality:
            queryset = queryset.filter(locality__icontains=locality)

        # 5. Mode Filter
        mode = params.get('mode')
        if mode and mode in ['HOME', 'ONLINE', 'BOTH']:
            if mode == 'BOTH':
                queryset = queryset.filter(teaching_mode='BOTH')
            elif mode == 'HOME':
                queryset = queryset.filter(Q(teaching_mode='HOME') | Q(teaching_mode='BOTH'))
            elif mode == 'ONLINE':
                queryset = queryset.filter(Q(teaching_mode='ONLINE') | Q(teaching_mode='BOTH'))

        return queryset


class PublicTutorDetailView(generics.RetrieveAPIView):
    """Get public details of a single tutor. Contact info only if unlocked."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PublicTutorProfileSerializer
    queryset = TutorProfile.objects.filter(
        status_record__status='ACTIVE'
    ).select_related('user', 'status_record')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class ContactUnlockView(APIView):
    """Unlock a tutor's contact information by spending credits. Cost: 50 Credits."""
    permission_classes = [permissions.IsAuthenticated]

    UNLOCK_COST = 50

    def post(self, request, pk):
        if request.user.role != 'PARENT':
            return Response({"error": "Only parents can unlock tutor contacts."}, status=403)

        tutor_profile = get_object_or_404(TutorProfile, pk=pk)

        # Check if already unlocked
        if ContactUnlock.objects.filter(parent=request.user, tutor=tutor_profile).exists():
            return Response({
                "message": "Already unlocked",
                "phone": tutor_profile.user.phone,
                "email": tutor_profile.user.email,
            })

        # Check Credits
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        if wallet.balance < self.UNLOCK_COST:
            return Response({
                "error": "Insufficient credits",
                "required": self.UNLOCK_COST,
                "current": wallet.balance,
            }, status=402)

        # Deduct & Unlock (Atomic)
        try:
            with transaction.atomic():
                wallet.debit(self.UNLOCK_COST, f"Unlocked contact of {tutor_profile.user.username}")
                ContactUnlock.objects.create(parent=request.user, tutor=tutor_profile)

            return Response({
                "message": "Contact unlocked successfully!",
                "phone": tutor_profile.user.phone,
                "email": tutor_profile.user.email,
                "remaining_balance": wallet.balance,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class UnlockedContactsView(APIView):
    """Get a list of all tutors whose contacts a parent has unlocked."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PARENT':
            return Response({"error": "Only parents can view unlocked contacts."}, status=403)

        unlocks = ContactUnlock.objects.filter(
            parent=request.user
        ).select_related('tutor__user')

        data = []
        for unlock in unlocks:
            tutor = unlock.tutor
            user = tutor.user
            data.append({
                "id": tutor.id,
                "name": tutor.full_name or user.get_full_name() or "Tutor",
                "phone": user.phone,
                "email": user.email,
                "subjects": tutor.subjects if isinstance(tutor.subjects, list) else [],
                "locality": tutor.locality,
                "profile_image": tutor.profile_image.url if tutor.profile_image else (tutor.external_profile_image_url or None),
                "unlocked_at": unlock.unlocked_at,
            })


class FavouriteTutorToggleView(APIView):
    """Toggle a tutor's favorite status for the current parent."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'PARENT':
            return Response({"error": "Only parents can favorite tutors."}, status=403)

        tutor_profile = get_object_or_404(TutorProfile, pk=pk)
        from .models import FavouriteTutor
        
        favourite, created = FavouriteTutor.objects.get_or_create(
            parent=request.user, 
            tutor=tutor_profile
        )

        if not created:
            favourite.delete()
            return Response({"is_favourite": False, "message": "Removed from favourites"})
        
        return Response({"is_favourite": True, "message": "Added to favourites"}, status=201)


class FavouriteTutorListView(generics.ListAPIView):
    """List all tutors favorited by the current parent."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PublicTutorProfileSerializer

    def get_queryset(self):
        if self.request.user.role != 'PARENT':
            return TutorProfile.objects.none()
        
        from .models import FavouriteTutor
        favourite_ids = FavouriteTutor.objects.filter(
            parent=self.request.user
        ).values_list('tutor_id', flat=True)
        
        return TutorProfile.objects.filter(
            id__in=favourite_ids
        ).select_related('user', 'status_record')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
