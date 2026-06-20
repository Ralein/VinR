
## 2024-05-24 - Parallelize Independent HTTP Requests in Fastapi
**Learning:** While SQLAlchemy AsyncSession restricts concurrent execution for database calls (meaning independent database queries cannot use `asyncio.gather` on the same session object), independent external HTTP requests (e.g., via `httpx.AsyncClient`) do not share this limitation.
**Action:** Always parallelize independent external API calls using `asyncio.gather` to reduce overall latency to `max(latency(A), latency(B))` rather than `latency(A) + latency(B)`.
