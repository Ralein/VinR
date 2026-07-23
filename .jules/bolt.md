## 2023-10-25 - Prevented N+1 in Celery push notification workers
**Learning:** Sequential processing in recurring scheduled scripts can accumulate vast delays when firing asynchronous I/O ops (like HTTP queries) repeatedly within a database loop. Expo provides a bulk batching API capable of 100 messages at a time, but this app was iterating manually, invoking latency blocks on scale-up.
**Action:** When scheduling external interactions loop processing via Celery or Cron, always queue items and execute natively via a batch endpoint (e.g. `_send_in_batches`) avoiding sequential N+1 delays.
