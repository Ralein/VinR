## 2024-06-15 - Concurrent HTTP Requests

**Learning:** Independent external HTTP requests should be parallelized in Python using `asyncio.gather` to reduce total latency, but this must be done carefully. While this works great for `httpx.AsyncClient` calls, it cannot be safely used for concurrent database queries using a shared SQLAlchemy `AsyncSession`.
**Action:** Always look for sequential network I/O calls that can be grouped via `asyncio.gather`. For database queries, ensure separate `AsyncSession` instances are used if concurrent execution is necessary.
