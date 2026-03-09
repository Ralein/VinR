"""Notification Service — FCM push notification delivery."""


async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: dict | None = None,
) -> bool:
    """
    Send a push notification via Firebase Cloud Messaging.

    This is a stub — real implementation in Sprint 2.1.

    Args:
        token: FCM device token
        title: Notification title
        body: Notification body text
        data: Optional data payload for deep linking

    Returns:
        True if sent successfully
    """
    # TODO: Implement FCM push via firebase-admin SDK
    return True
