"""
Master Data CRUD Views for Superadmin
Handles Subject, Board, ClassLevel, Location management
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Subject, Board, ClassLevel, Location
from .master_serializers import SubjectSerializer, BoardSerializer, ClassLevelSerializer, LocationSerializer
from users.admin_views import IsSuperAdmin


# ==================== PUBLIC ENDPOINTS (GET only) ====================

class PublicMasterDataView(APIView):
    """
    Public endpoint to get all active master data for dropdowns.
    Used by JobWizard, Signup, etc.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        subjects = Subject.objects.filter(is_active=True)
        boards = Board.objects.filter(is_active=True)
        class_levels = ClassLevel.objects.filter(is_active=True)
        locations = Location.objects.filter(is_active=True)

        return Response({
            'subjects': SubjectSerializer(subjects, many=True).data,
            'boards': BoardSerializer(boards, many=True).data,
            'class_levels': ClassLevelSerializer(class_levels, many=True).data,
            'locations': LocationSerializer(locations, many=True).data,
        })


# ==================== SUPERADMIN CRUD ENDPOINTS ====================

# --- Subjects ---
class SubjectListCreateView(generics.ListCreateAPIView):
    """List all subjects or create a new one"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdmin]


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific subject"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdmin]


# --- Boards ---
class BoardListCreateView(generics.ListCreateAPIView):
    """List all boards or create a new one"""
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [IsSuperAdmin]


class BoardDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific board"""
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [IsSuperAdmin]


# --- Class Levels ---
class ClassLevelListCreateView(generics.ListCreateAPIView):
    """List all class levels or create a new one"""
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_classes = [IsSuperAdmin]


class ClassLevelDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific class level"""
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_classes = [IsSuperAdmin]


# --- Locations ---
class LocationListCreateView(generics.ListCreateAPIView):
    """List all locations or create a new one"""
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        queryset = Location.objects.all()
        # Optional search by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        return queryset


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific location"""
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsSuperAdmin]


# --- Bulk Seed Endpoint (One-time setup) ---
class SeedMasterDataView(APIView):
    """
    One-time endpoint to seed initial master data.
    Call this after first deployment to populate dropdowns.
    """
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        created = {'subjects': 0, 'boards': 0, 'class_levels': 0, 'locations': 0}

        # Seed Subjects
        default_subjects = [
            ('Mathematics', 'Calculator', 'Academic'),
            ('Physics', 'Atom', 'Academic'),
            ('Chemistry', 'FlaskConical', 'Academic'),
            ('Biology', 'Dna', 'Academic'),
            ('English', 'BookOpen', 'Academic'),
            ('Hindi', 'Globe', 'Academic'),
            ('Computer Science', 'Code', 'Academic'),
            ('History', 'Landmark', 'Academic'),
            ('Geography', 'Map', 'Academic'),
            ('Economics', 'TrendingUp', 'Academic'),
            ('Accountancy', 'Calculator', 'Academic'),
            ('JEE Mains', 'GraduationCap', 'Competitive'),
            ('JEE Advanced', 'GraduationCap', 'Competitive'),
            ('NEET', 'Stethoscope', 'Competitive'),
            ('UPSC', 'Award', 'Competitive'),
            ('CAT', 'BarChart', 'Competitive'),
        ]
        for idx, (name, icon, category) in enumerate(default_subjects):
            obj, was_created = Subject.objects.get_or_create(
                name=name, defaults={'icon': icon, 'category': category, 'order': idx}
            )
            if was_created:
                created['subjects'] += 1

        # Seed Boards
        default_boards = [
            ('Central Board of Secondary Education', 'CBSE'),
            ('Indian Certificate of Secondary Education', 'ICSE'),
            ('Maharashtra State Board', 'MSBSHSE'),
            ('Karnataka State Board', 'KSEEB'),
            ('Tamil Nadu State Board', 'TNBSE'),
            ('Uttar Pradesh Board', 'UP Board'),
            ('West Bengal Board', 'WBBSE'),
            ('International Baccalaureate', 'IB'),
            ('Cambridge IGCSE', 'IGCSE'),
        ]
        for idx, (name, short_name) in enumerate(default_boards):
            obj, was_created = Board.objects.get_or_create(
                name=name, defaults={'short_name': short_name, 'order': idx}
            )
            if was_created:
                created['boards'] += 1

        # Seed Class Levels
        default_class_levels = [
            ('Nursery', 'Pre-School'),
            ('LKG', 'Pre-School'),
            ('UKG', 'Pre-School'),
            ('Class 1', 'School'),
            ('Class 2', 'School'),
            ('Class 3', 'School'),
            ('Class 4', 'School'),
            ('Class 5', 'School'),
            ('Class 6', 'School'),
            ('Class 7', 'School'),
            ('Class 8', 'School'),
            ('Class 9', 'School'),
            ('Class 10', 'School'),
            ('Class 11', 'School'),
            ('Class 12', 'School'),
            ('Undergraduate', 'College'),
            ('Postgraduate', 'College'),
        ]
        for idx, (name, category) in enumerate(default_class_levels):
            obj, was_created = ClassLevel.objects.get_or_create(
                name=name, defaults={'category': category, 'order': idx}
            )
            if was_created:
                created['class_levels'] += 1

        # Seed Locations (Major Indian cities)
        default_locations = [
            ('Mumbai', 'Maharashtra'),
            ('Delhi', 'Delhi'),
            ('Bangalore', 'Karnataka'),
            ('Hyderabad', 'Telangana'),
            ('Chennai', 'Tamil Nadu'),
            ('Kolkata', 'West Bengal'),
            ('Pune', 'Maharashtra'),
            ('Ahmedabad', 'Gujarat'),
            ('Jaipur', 'Rajasthan'),
            ('Lucknow', 'Uttar Pradesh'),
            ('Chandigarh', 'Punjab'),
            ('Kochi', 'Kerala'),
            ('Indore', 'Madhya Pradesh'),
            ('Bhopal', 'Madhya Pradesh'),
            ('Nagpur', 'Maharashtra'),
        ]
        for city, state in default_locations:
            obj, was_created = Location.objects.get_or_create(
                city=city, defaults={'state': state}
            )
            if was_created:
                created['locations'] += 1

        return Response({
            'message': 'Master data seeded successfully',
            'created': created
        })
