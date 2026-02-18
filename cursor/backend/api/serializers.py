from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Job, Rental, Device, JobReport


class AssignedToSerializer(serializers.ModelSerializer):
    """Serializer for assigned user details"""
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
    
    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'employee'


class JobSerializer(serializers.ModelSerializer):
    assigned_to_details = AssignedToSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = Job
        fields = "__all__"


class RentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = "__all__"


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = "__all__"


class JobReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobReport
        fields = "__all__"
        extra_kwargs = {
            'completion_photo': {'required': False}
        }


