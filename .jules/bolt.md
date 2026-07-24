## 2023-10-25 - Prevented N+1 in Celery push notification workers
**Learning:** Sequential processing in recurring scheduled scripts can accumulate vast delays when firing asynchronous I/O ops (like HTTP queries) repeatedly within a database loop. Expo provides a bulk batching API capable of 100 messages at a time, but this app was iterating manually, invoking latency blocks on scale-up.
**Action:** When scheduling external interactions loop processing via Celery or Cron, always queue items and execute natively via a batch endpoint (e.g. `_send_in_batches`) avoiding sequential N+1 delays.
## 2023-10-25 - Parallelized Event Search API calls
**Learning:** In backend service functions making multiple external HTTP requests (e.g., `_search_google_places` and `_search_eventbrite`), awaiting them sequentially accumulates the total latency.
**Action:** When calling multiple independent external APIs in FastAPI/Python, always use `asyncio.gather` to execute them concurrently to drastically reduce request latency.
