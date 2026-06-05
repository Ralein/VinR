
## 2024-06-05 - Avoid Sequential External API Requests in Background Tasks
**Learning:** Making sequential external HTTP requests (N+1 queries) inside loops in background Celery tasks blocks processing and scales poorly with list sizes, causing significant latency.
**Action:** When sending notifications or interacting with external APIs for a list of targets, always collect the necessary payload variables in a list first, and use batching/bulk endpoints (e.g., `send_bulk_push_notifications` in chunks) to drastically reduce latency and connection overhead.
