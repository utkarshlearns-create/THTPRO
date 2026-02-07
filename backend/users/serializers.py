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

from .models import TutorProfile, TutorKYC, TutorStatus, Enquiry

class TutorKYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorKYC
        fields = ['id', 'status', 'submission_count', 'rejection_reason', 'created_at', 'aadhaar_document', 'education_certificate', 'photo']
        read_only_fields = ['status', 'submission_count', 'rejection_reason', 'created_at']

class TutorStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorStatus
        fields = ['status', 'last_updated']

class TutorProfileSerializer(serializers.ModelSerializer):
    kyc = TutorKYCSerializer(source='kyc_records', many=True, read_only=True)
    status_msg = TutorStatusSerializer(source='status_record', read_only=True)
    
    class Meta:
        model = TutorProfile
        fields = '__all__'
        read_only_fields = ['user', 'profile_completion_percentage']

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

class UserSerializer(serializers.ModelSerializer):
    tutor_profile = TutorProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'password', 'tutor_profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

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
