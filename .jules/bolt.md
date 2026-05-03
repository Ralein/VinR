## 2025-02-28 - Parallelizing Independent Async Functions
**Learning:** Sequential await statements for independent external HTTP APIs are a significant source of latency (N+1 bottleneck). SQLAlchemy AsyncSession does not support concurrency with `asyncio.gather`, but external HTTP requests via `httpx` and `AsyncClient` within service modules like `events_service.py` do support full concurrency.
**Action:** When making multiple independent network calls in FastAPI services, always use `asyncio.gather` instead of sequential `await`s to effectively halve response times.
