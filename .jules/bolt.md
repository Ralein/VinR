
## 2024-07-08 - Concurrent API Execution in Events Service
**Learning:** Independent external HTTP requests in the events service were being awaited sequentially, accumulating latency. Unlike SQLAlchemy database calls which restrict concurrency, `httpx` API calls are safe to parallelize.
**Action:** Always use `asyncio.gather` for independent external API requests (like Google Places and Eventbrite) to minimize total request time and improve performance.
