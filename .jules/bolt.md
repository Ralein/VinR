## 2026-06-16 - [Parallelize External API Calls]
**Learning:** Sequential external HTTP requests in API endpoints (e.g. searching Eventbrite and Google Places one after the other) create an unnecessary N+1 network latency bottleneck. Unlike database calls with SQLAlchemy `AsyncSession`, external HTTP requests via `httpx.AsyncClient` do not share concurrent execution limitations.
**Action:** Always use `asyncio.gather` to execute independent external API network requests concurrently to reduce overall latency and improve response times.
