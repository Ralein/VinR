## 2024-05-23 - Avoid N+1 API Calls for Notifications
**Learning:** Found that the notification scheduler iterates over users and calls `send_push_notification` one by one, resulting in N+1 HTTP requests. The `notification_service.py` file actually has a `send_bulk_push_notifications` method that is currently unused by the scheduler tasks!
**Action:** Use `send_bulk_push_notifications` to batch Expo push notifications.
