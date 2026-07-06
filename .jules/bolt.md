## 2024-05-15 - [Performance] Parallelize external API calls
**Learning:** Independent external HTTP requests in Python's asyncio should not run sequentially. While SQLAlchemy AsyncSession restricts concurrent execution for database calls, this limitation does not apply to external API requests using `httpx`.
**Action:** Always use `asyncio.gather` for independent external I/O requests like API calls to drastically reduce overall latency.
