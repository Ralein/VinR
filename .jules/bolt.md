## 2026-04-14 - Optimize Background Job Performance (N+1 HTTP calls in Celery)
**Learning:** Sequential external HTTP requests (like sending push notifications) inside a Celery loop can cause severe N+1 bottlenecks. Expo supports batching.
**Action:** Use `send_bulk_push_notifications` to batch API requests and significantly reduce background task execution time.
