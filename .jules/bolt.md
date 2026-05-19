
## 2024-05-18 - [Parallelizing External API Calls]
**Learning:** While SQLAlchemy `AsyncSession` does not allow concurrent execution, independent external HTTP requests (e.g., via `httpx.AsyncClient`) do not share this limitation and can be safely parallelized. In `events_service.py`, `search_events` called Google Places and Eventbrite sequentially.
**Action:** When making multiple independent external API requests, always use `asyncio.gather` to execute them concurrently, reducing total latency to roughly the duration of the slowest request.
