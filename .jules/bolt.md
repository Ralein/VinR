## 2024-07-03 - Parallelize Independent External API Calls
**Learning:** Sequential await of independent external HTTP calls (Google Places and Eventbrite) causes unnecessary latency accumulation. While SQLAlchemy AsyncSession restricts concurrent DB calls, `httpx` and external requests do not share this limitation.
**Action:** Always use `asyncio.gather` for independent external API requests to reduce latency to the max of individual request times.
