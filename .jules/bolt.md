
## 2026-07-01 - [Batch push notifications to prevent N+1 API calls]
**Learning:** Sending external HTTP requests (like Expo push notifications) sequentially in a loop creates a massive N+1 bottleneck, causing tasks to time out or run unnecessarily long due to accumulated network latency.
**Action:** Always batch external API calls when processing lists in background tasks. When using Expo Push API, accumulate messages into chunks of 100 (API limit) and use the `send_bulk_push_notifications` utility to process them efficiently.
