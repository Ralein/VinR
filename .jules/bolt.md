## 2024-06-01 - Concurrency with Independent External APIs
**Learning:** Discovered that independent external HTTP API calls (like Google Places and Eventbrite) were being awaited sequentially in `search_events`, leading to accumulated network latency.
**Action:** Always use `asyncio.gather()` to parallelize independent external API requests in FastAPI/asyncio applications to improve overall response times.
