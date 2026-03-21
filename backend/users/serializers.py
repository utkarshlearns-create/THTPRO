import json
import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

logger = logging.getLogger(__name__)
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
from .utils import generate_signed_kyc_url, get_tutor_image_url
from core.roles import ADMIN_ROLES

class FavouriteTutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavouriteTutor
        fields = ['id', 'tutor', 'created_at']

class TutorKYCSerializer(serializers.ModelSerializer):
    """Serialize KYC records with all document fields.
    On write: accepts file uploads for all document fields.
    On read: returns signed Cloudinary URLs for authorized users.
    """
    tutor = serializers.SerializerMethodField()

    class Meta:
        model = TutorKYC
        fields = [
            'id', 'tutor', 'status', 'submission_count', 'rejection_reason',
            'documents_to_resubmit', 'admin_feedback',
            'aadhaar_front', 'aadhaar_back', 'highest_qualification_certificate',
            'pan_document', 'passport_document', 'police_verification', 'teaching_certificate',
            'aadhaar_front_verified', 'aadhaar_back_verified',
            'qualification_verified', 'pan_verified',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'status', 'submission_count', 'rejection_reason',
            'documents_to_resubmit', 'admin_feedback',
            'aadhaar_front_verified', 'aadhaar_back_verified',
            'qualification_verified', 'pan_verified',
            'created_at', 'updated_at',
        ]

    def get_tutor(self, obj):
        profile = obj.tutor
        return {
            'id': profile.id,
            'user_id': profile.user_id,
            'full_name': profile.full_name,
            'user': {
                'username': profile.user.username,
                'phone': profile.user.phone,
                'email': profile.user.email,
            },
            'subjects': profile.subjects,
            'highest_qualification': profile.highest_qualification,
        }

    def _can_view_docs(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.role in ADMIN_ROLES:
            return True
        return getattr(obj.tutor, 'user_id', None) == request.user.id

    def _get_doc_url(self, field):
        if not field:
            return None
        public_id = getattr(field, 'public_id', None)
        if public_id:
            return generate_signed_kyc_url(public_id, expiry_seconds=3600)
        return field.url if hasattr(field, 'url') else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Replace raw file paths with signed URLs for authorized users
        doc_fields = [
            'aadhaar_front', 'aadhaar_back', 'highest_qualification_certificate',
            'pan_document', 'passport_document', 'police_verification', 'teaching_certificate',
        ]
        if self._can_view_docs(instance):
            for field_name in doc_fields:
                field_value = getattr(instance, field_name, None)
                data[field_name] = self._get_doc_url(field_value)
        else:
            for field_name in doc_fields:
                data[field_name] = None
        return data


class TutorStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorStatus
        fields = ['status', 'last_updated']

class TutorProfileSerializer(serializers.ModelSerializer):
    kyc = TutorKYCSerializer(source='kyc_records', many=True, read_only=True)
    status_msg = TutorStatusSerializer(source='status_record', read_only=True)
    image = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    contact_info = serializers.SerializerMethodField()
    
    class Meta:
        model = TutorProfile
        fields = [
            'id', 'user', 'full_name', 'gender', 'whatsapp_number', 
            'about_me', 'subjects', 'classes', 'class_subjects', 
            'locality', 'teaching_mode', 'teaching_experience_years', 
            'expected_fee', 'highest_qualification', 'is_bed', 'is_tet', 
            'other_certifications', 'profile_image', 'external_profile_image_url',
            'intro_video', 'profile_completion_percentage',
            'kyc', 'status_msg', 'image', 'is_unlocked', 'contact_info'
        ]
        read_only_fields = ['user', 'profile_completion_percentage']

    def to_internal_value(self, data):
        """
        Handle JSON stringified fields for multipart/form-data requests.
        Frontend often sends JSON as a string when including files.
        """
        mutable_data = data.copy() if hasattr(data, 'copy') else data
        
        # List of JSON fields that might be stringified from frontend
        json_fields = ['class_subjects', 'subjects', 'classes', 'other_certifications']
        
        for field in json_fields:
            if field in mutable_data:
                val = mutable_data[field]
                if isinstance(val, str):
                    try:
                        # Only try to load if it looks like JSON
                        if val.strip().startswith(('[', '{')):
                            mutable_data[field] = json.loads(val)
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Failed to parse JSON for field {field}: {e}")
                        # Keep original value (might be a simple string)
                        pass
        
        return super().to_internal_value(mutable_data)


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
        return get_tutor_image_url(obj)




    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        # If user is the tutor themselves, always unlocked
        if user == obj.user:
            return True
        
        # Admin roles
        if user.role in ['COUNSELLOR', 'TUTOR_ADMIN', 'SUPERADMIN']:
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

        if hasattr(obj, 'favourited_by_current_user'):
            return len(obj.favourited_by_current_user) > 0

        return FavouriteTutor.objects.filter(parent=request.user, tutor=obj).exists()

    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # If user is the tutor themselves, always unlocked
        if request.user == obj.user:
            return True
        
        # Superadmins/Admins can see everything
        if request.user.role in ['COUNSELLOR', 'TUTOR_ADMIN', 'SUPERADMIN', 'TEACHER']:
             if request.user.role in ['COUNSELLOR', 'TUTOR_ADMIN', 'SUPERADMIN']:
                 return True
        
        if hasattr(obj, 'unlocked_by_current_user'):
            return len(obj.unlocked_by_current_user) > 0

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
        return get_tutor_image_url(obj)


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
