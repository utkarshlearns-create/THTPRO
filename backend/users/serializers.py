from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['role'] = user.role
        token['phone'] = user.phone
        token['username'] = user.username
        
        # Add department if admin
        if hasattr(user, 'admin_profile'):
            token['department'] = user.admin_profile.department
        else:
            token['department'] = None

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra responses to the API
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['phone'] = self.user.phone
        
        if hasattr(self.user, 'admin_profile'):
             data['department'] = self.user.admin_profile.department
        else:
             data['department'] = None
             
        return data


from .models import TutorProfile

from .models import TutorProfile, TutorKYC, TutorStatus, Enquiry, InstitutionProfile, FavouriteTutor

class FavouriteTutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavouriteTutor
        fields = ['id', 'tutor', 'created_at']

class TutorKYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorKYC
        fields = ['id', 'status', 'submission_count', 'rejection_reason', 'created_at', 'aadhaar_front', 'aadhaar_back', 'highest_qualification_certificate']
        read_only_fields = ['status', 'submission_count', 'rejection_reason', 'created_at']

class TutorStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorStatus
        fields = ['status', 'last_updated']

class TutorProfileSerializer(serializers.ModelSerializer):
    kyc = TutorKYCSerializer(source='kyc_records', many=True, read_only=True)
    status_msg = TutorStatusSerializer(source='status_record', read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = TutorProfile
        fields = '__all__'
        read_only_fields = ['user', 'profile_completion_percentage']

    def update(self, instance, validated_data):
        # Automatically sync classes and subjects lists from class_subjects mapping
        if 'class_subjects' in validated_data:
            class_subjects = validated_data['class_subjects']
            
            # Extract unique classes
            unique_classes = list(class_subjects.keys())
            
            # Extract unique subjects
            unique_subjects = set()
            for subjects_list in class_subjects.values():
                if isinstance(subjects_list, list):
                    unique_subjects.update(subjects_list)
            
            validated_data['classes'] = unique_classes
            validated_data['subjects'] = list(unique_subjects)
            
        return super().update(instance, validated_data)

    def get_image(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        if obj.external_profile_image_url:
            url = obj.external_profile_image_url
            # Transform Google Drive links to direct image links
            if "drive.google.com" in url:
                import re
                match = re.search(r'id=([a-zA-Z0-9_-]+)', url) or re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
                if match:
                    file_id = match.group(1)
                    return f"https://lh3.googleusercontent.com/d/{file_id}"
            return url
        return None



    is_unlocked = serializers.SerializerMethodField()
    contact_info = serializers.SerializerMethodField()

    def get_is_unlocked(self, obj):
        user = self.context.get('request').user
        if not user.is_authenticated:
            return False
        # If user is the tutor themselves, always unlocked
        if user == obj.user:
            return True
        # Check if ContactUnlock record exists
        # We need to import ContactUnlock model inside method or at top (it is imported at top in views, but here in serializers?)
        # Let's check imports.
        # It's not imported. We need to import it.
        from .models import ContactUnlock
        return ContactUnlock.objects.filter(parent=user, tutor=obj).exists()

    def get_contact_info(self, obj):
        # We can reuse the logic or just check if we have access
        # For efficiency, we might want to just check is_unlocked logic again or rely on context
        if self.get_is_unlocked(obj):
            return {
                "phone": obj.user.phone,
                "email": obj.user.email
            }
        return None


class PublicTutorProfileSerializer(serializers.ModelSerializer):
    """
    Limited serializer for public/search view.
    Excludes sensitive info like Phone/WhatsApp/Full Address unless unlocked.
    """
    name = serializers.SerializerMethodField()
    subjects = serializers.ListField(read_only=True) # Ensure JSON parsed
    classes = serializers.ListField(read_only=True)
    image = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    is_favourite = serializers.SerializerMethodField()
    contact_info = serializers.SerializerMethodField()
    
    class Meta:
        model = TutorProfile
        fields = [
            'id', 'name', 'gender', 'about_me', 
            'subjects', 'classes', 'class_subjects', 'locality', 'teaching_mode', 
            'teaching_experience_years', 'expected_fee', 
            'highest_qualification', 'is_bed', 'is_tet', 
            'profile_completion_percentage', 'image', 'intro_video',
            'is_unlocked', 'is_favourite', 'contact_info'
        ]
        
    def get_name(self, obj):
        return obj.full_name or obj.user.first_name
    
    def get_is_favourite(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return FavouriteTutor.objects.filter(parent=request.user, tutor=obj).exists()

    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # If user is the tutor themselves, always unlocked
        if request.user == obj.user:
            return True
        
        # Superadmins/Admins can see everything
        if request.user.role in ['COUNSELLOR', 'TUTOR_ADMIN', 'SUPERADMIN', 'TEACHER']: # Allowing other teachers to see? Maybe not. Let's start with Admin.
             if request.user.role in ['COUNSELLOR', 'TUTOR_ADMIN', 'SUPERADMIN']:
                 return True
        
        from .models import ContactUnlock
        return ContactUnlock.objects.filter(parent=request.user, tutor=obj).exists()

    def get_contact_info(self, obj):
        if self.get_is_unlocked(obj):
            return {
                "phone": obj.user.phone,
                "email": obj.user.email,
                "whatsapp": obj.whatsapp_number
            }
        return None
        
    def get_image(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        if obj.external_profile_image_url:
            url = obj.external_profile_image_url
            # Transform Google Drive links to direct image links
            if "drive.google.com" in url:
                import re
                # Handle both id=FILE_ID and /file/d/FILE_ID/
                match = re.search(r'id=([a-zA-Z0-9_-]+)', url) or re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
                if match:
                    file_id = match.group(1)
                    return f"https://lh3.googleusercontent.com/d/{file_id}"
            return url
        return None


class InstitutionProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionProfile
        fields = '__all__'
        read_only_fields = ['user', 'is_verified', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    tutor_profile = TutorProfileSerializer(read_only=True)
    institution_profile = InstitutionProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'role', 'phone', 'password', 'city', 'area', 'address', 'tutor_profile', 'institution_profile']
        extra_kwargs = {'password': {'write_only': True}, 'first_name': {'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
            
        # Create profile based on role (TutorProfile is handled by signals)
        if user.role == 'INSTITUTION':
            InstitutionProfile.objects.create(
                user=user,
                institution_name=user.first_name or "New Institution", # Default name
                contact_person=user.first_name or "",
            )
            
        return user

class UserAdminSerializer(serializers.ModelSerializer):
    """Serializer for Admin/Superadmin to view user details"""
    department = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'is_active', 'date_joined', 'last_login', 'department']
        read_only_fields = fields

    def get_department(self, obj):
        if hasattr(obj, 'admin_profile'):
            return obj.admin_profile.department
        return None

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'
        read_only_fields = ['status', 'created_at']
