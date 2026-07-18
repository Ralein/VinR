## 2026-07-18 - Concurrent HTTP requests in events_service
**Learning:** While SQLAlchemy AsyncSession restricts concurrent execution for database calls, independent external HTTP requests (e.g., via httpx.AsyncClient) do not share this limitation. The `search_events` function was making sequential calls to Google Places and Eventbrite, causing network latency to accumulate.
**Action:** Use `asyncio.gather` for independent external HTTP requests to minimize latency, but avoid it for database calls sharing the same session.
