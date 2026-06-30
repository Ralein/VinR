## 2024-10-24 - Parallelizing Independent External API Calls
**Learning:** While SQLAlchemy `AsyncSession` restricts concurrent execution for database calls, independent external HTTP requests (like Google Places and Eventbrite APIs) do not share this limitation and should be parallelized using `asyncio.gather` to reduce latency.
**Action:** Always wrap independent async external API calls in `asyncio.gather` rather than awaiting them sequentially to avoid accumulating network latency.
