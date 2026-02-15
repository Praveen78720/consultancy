from django.urls import re_path

from .consumers import NotificationConsumer

websocket_urlpatterns = [
    # Frontend WebSocket URL: ws://<host>/ws/notifications/
    re_path(r"^ws/notifications/$", NotificationConsumer.as_asgi()),
]



