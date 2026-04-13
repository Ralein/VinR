## 2024-05-18 - [Bulk Push Notifications Optimization]
**Learning:** Sequential HTTP requests in a loop (like `send_push_notification` to an external service) create N+1 API call bottlenecks, causing the background task to run slower with every new user.
**Action:** When processing lists in background tasks (e.g., Celery), utilize bulk or batch APIs (such as `send_bulk_push_notifications` for Expo) to combine messages into chunks and send them in a single request.
