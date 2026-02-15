import json

from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Simple broadcast-style notifications consumer.

    All connected clients join the same "notifications" group and receive any
    messages that are sent by any client or from the server side.
    """

    group_name = "notifications"

    async def connect(self):
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Initial welcome payload so the frontend can verify connection.
        await self.send_json(
            {
                "type": "welcome",
                "message": "Connected to realtime notifications.",
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        """
        When the client sends a JSON payload of the form:

        { "message": "Some text", "sender": "frontend" }

        we broadcast it to all connected clients.
        """
        if not text_data:
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message = data.get("message", "")
        sender = data.get("sender", "anonymous")

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast_message",
                "message": message,
                "sender": sender,
            },
        )

    async def broadcast_message(self, event):
        await self.send_json(
            {
                "type": "notification",
                "message": event.get("message", ""),
                "sender": event.get("sender", "server"),
            }
        )

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content))




