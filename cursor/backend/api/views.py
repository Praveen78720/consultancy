import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.utils import timezone

from .models import Job, Rental, Device, JobReport
from .serializers import JobSerializer, RentalSerializer, DeviceSerializer, JobReportSerializer

logger = logging.getLogger(__name__)


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating job with data: {request.data}")
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        logger.info("Listing jobs")
        return super().list(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests for partial updates (e.g., status change)."""
        logger.info(f"Partially updating job {kwargs.get('pk')} with data: {request.data}")
        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests."""
        logger.info(f"Updating job {kwargs.get('pk')} with data: {request.data}")
        return super().update(request, *args, **kwargs)


class RentalViewSet(viewsets.ModelViewSet):
    queryset = Rental.objects.all().order_by("-created_at")
    serializer_class = RentalSerializer

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating rental with data: {request.data}")
        logger.info(f"Files: {request.FILES}")
        device_serial = request.data.get('device_serial')
        try:
            device = Device.objects.get(serial_no=device_serial)
            device.availability = 'rented'
            device.save()
        except Device.DoesNotExist:
            logger.error(f"Device with serial {device_serial} does not exist")
            return Response({"error": "Device not found"}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all().order_by("model")
    serializer_class = DeviceSerializer


class JobReportViewSet(viewsets.ModelViewSet):
    queryset = JobReport.objects.all().order_by("-created_at")
    serializer_class = JobReportSerializer


# Authentication API endpoints

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Authenticate a user and return their token and role.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find user by email (username field stores email)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Authenticate using username (which is email)
    user = authenticate(username=user.username, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)

        # Determine role based on is_staff flag
        role = 'admin' if user.is_staff else 'employee'

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': role,
                'is_staff': user.is_staff,
            }
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user (admin or employee).
    Only existing admins can create new admins.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    username = request.data.get('username', email)
    role = request.data.get('role', 'employee')  # 'admin' or 'employee'

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already taken'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=(role == 'admin'),  # Admin users have is_staff=True
    )

    # Create token for the new user
    token, created = Token.objects.get_or_create(user=user)

    return Response({
        'message': 'User created successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'role': role,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_user_profile(request):
    """
    Get current user's profile.
    """
    user = request.user
    role = 'admin' if user.is_staff else 'employee'

    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'role': role,
        'is_staff': user.is_staff,
    })


@api_view(['GET'])
def get_dashboard_stats(request):
    """
    Get dashboard statistics for admin.
    """
    total_jobs = Job.objects.count()
    open_jobs = Job.objects.filter(status='open').count()
    in_progress_jobs = Job.objects.filter(status='in_progress').count()
    completed_jobs = Job.objects.filter(status='completed').count()

    total_rentals = Rental.objects.count()
    active_rentals = Rental.objects.filter(to_date__gte=timezone.now().date()).count()
    completed_rentals = Rental.objects.filter(to_date__lt=timezone.now().date()).count()

    total_devices = Device.objects.count()
    available_devices = Device.objects.filter(availability='available').count()
    rented_devices = Device.objects.filter(availability='rented').count()

    total_users = User.objects.count()
    admin_users = User.objects.filter(is_staff=True).count()
    employee_users = User.objects.filter(is_staff=False).count()

    return Response({
        'jobs': {
            'total': total_jobs,
            'open': open_jobs,
            'in_progress': in_progress_jobs,
            'completed': completed_jobs,
        },
        'rentals': {
            'total': total_rentals,
            'active': active_rentals,
            'completed': completed_rentals,
        },
        'devices': {
            'total': total_devices,
            'available': available_devices,
            'rented': rented_devices,
        },
        'users': {
            'total': total_users,
            'admins': admin_users,
            'employees': employee_users,
        },
    })


