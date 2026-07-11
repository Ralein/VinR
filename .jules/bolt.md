## 2026-07-11 - Optimize Search Events API Calls
**Learning:** Independent external HTTP requests in FastAPI can be executed concurrently using `asyncio.gather` to significantly reduce latency, unlike DB queries with single SQLAlchemy AsyncSession objects.
**Action:** Look for sequential independent HTTP calls and parallelize them using `asyncio.gather`.
