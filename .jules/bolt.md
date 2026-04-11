## 2024-06-25 - Batching API calls in loops
**Learning:** Sending external HTTP requests (like push notifications) sequentially in a loop inside Celery tasks accumulates network latency, leading to N+1 API call bottlenecks and slower background processing.
**Action:** Always look for and utilize bulk or batch APIs (e.g., `send_bulk_push_notifications`) when processing lists of items in background tasks to reduce external HTTP requests and improve efficiency.
