## 2024-05-20 - Concurrent External API Calls vs Database Queries
**Learning:** Sequential awaits for independent external APIs (like Google Places and Eventbrite) create an unnecessary bottleneck, summing their latencies.
**Action:** Always use `asyncio.gather` for independent external API calls to reduce latency by parallelizing them, as they do not share the concurrency restrictions of SQLAlchemy `AsyncSession`.
