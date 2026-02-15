from rest_framework import serializers

from .models import Job, Rental, Device, JobReport


class JobSerializer(serializers.ModelSerializer):
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


