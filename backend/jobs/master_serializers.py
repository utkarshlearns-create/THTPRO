"""
Master Data Serializers for Subject, Board, ClassLevel, Location
"""
from rest_framework import serializers
from .models import Subject, Board, ClassLevel, Location, Locality


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'icon', 'category', 'is_active', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'short_name', 'is_active', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClassLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = ['id', 'name', 'category', 'order', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class LocalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Locality
        fields = ['id', 'name', 'pincode', 'is_active']


class LocationSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    localities = LocalitySerializer(many=True, read_only=True)

    class Meta:
        model = Location
        fields = ['id', 'city', 'state', 'pincode', 'is_active', 'display_name', 'localities', 'created_at']
        read_only_fields = ['id', 'created_at', 'display_name', 'localities']

    def get_display_name(self, obj):
        return str(obj)
