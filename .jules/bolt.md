## 2024-05-18 - Concurrent External API Calls
**Learning:** Sequential execution of independent external API calls creates a performance bottleneck by accumulating network latency. While some ORM sessions (like SQLAlchemy AsyncSession) prevent concurrent execution, independent HTTP requests using `httpx.AsyncClient` are safe to run concurrently.
**Action:** Use `asyncio.gather()` to run independent external HTTP requests in parallel, effectively cutting the total wait time to the latency of the slowest request.
