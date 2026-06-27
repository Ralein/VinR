## 2024-05-18 - Parallelize external API requests
**Learning:** Independent external HTTP requests in Python's asyncio do not share the concurrent execution limitation of SQLAlchemy AsyncSessions and can be a significant source of latency if awaited sequentially.
**Action:** Always use `asyncio.gather` to execute independent external API calls concurrently to reduce overall latency.
