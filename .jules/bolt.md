## 2025-02-23 - Concurrent API requests in events service
**Learning:** Independent external HTTP requests (like fetching from Google Places and Eventbrite) can and should be parallelized using `asyncio.gather` to reduce latency. This is safe and recommended, unlike database queries with SQLAlchemy `AsyncSession` which cannot be parallelized directly.
**Action:** Always look for independent `await` statements on external HTTP calls and combine them using `asyncio.gather` where appropriate to optimize I/O performance.
