## 2025-04-06 - Safe Concurrency Boundaries
**Learning:** While SQLAlchemy `AsyncSession` is not thread-safe and does not support concurrent execution (like `asyncio.gather`), external HTTP calls using `httpx.AsyncClient` are perfectly safe to parallelize.
**Action:** When working in services that aggregate data from multiple external HTTP APIs (e.g., `events_service.py`), always parallelize independent requests using `asyncio.gather`. However, ensure that database operations within the same request are kept sequential or use scalar subqueries to avoid breaking the `AsyncSession`.
