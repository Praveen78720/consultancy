from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    JobViewSet, RentalViewSet, DeviceViewSet, JobReportViewSet,
    login_user, register_user, get_user_profile, get_dashboard_stats, get_all_users,
    delete_user
)

router = DefaultRouter()
router.register(r"jobs", JobViewSet, basename="job")
router.register(r"rentals", RentalViewSet, basename="rental")
router.register(r"devices", DeviceViewSet, basename="device")
router.register(r"reports", JobReportViewSet, basename="report")

urlpatterns = [
    # Core API endpoints used by the frontend
    path("", include(router.urls)),
    # Authentication endpoints
    path("auth/login/", login_user, name="api-login"),
    path("auth/register/", register_user, name="api-register"),
    path("auth/profile/", get_user_profile, name="api-profile"),
    # Dashboard stats
    path("dashboard/stats/", get_dashboard_stats, name="api-dashboard-stats"),
    # Users
    path("users/", get_all_users, name="api-users-list"),
    path("users/<int:user_id>/delete/", delete_user, name="api-user-delete"),
    # Legacy token endpoint (kept for backward compatibility)
    path("auth/token/", obtain_auth_token, name="api-token-auth"),
]



