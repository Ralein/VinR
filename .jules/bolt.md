## 2024-06-24 - Optimizing concurrent external API requests

**Learning:** While `AsyncSession` in SQLAlchemy prevents us from running concurrent database operations via `asyncio.gather`, independent external HTTP requests (like those via `httpx.AsyncClient` to Google Places and Eventbrite) do not have this limitation. They can and should be parallelized to minimize latency.
**Action:** When handling multiple independent external HTTP calls, default to using `asyncio.gather` instead of sequentially awaiting them to significantly speed up response times.
