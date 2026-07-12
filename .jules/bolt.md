## 2024-07-12 - Prevent N+1 API Calls in Celery Notification Tasks
**Learning:** Celery background tasks frequently looped over query results and executed blocking, slow HTTP requests (`send_push_notification`) one at a time. This results in N+1 HTTP calls.
**Action:** Replaced sequential individual API calls with the pre-existing `send_bulk_push_notifications` utility to process lists of messages in batches. When modifying tasks that iterate over users and call an external service, accumulate objects in a list and dispatch them in chunks.
