## 2024-05-08 - Parallelize Independent External API Calls
**Learning:** External API requests (e.g., via httpx.AsyncClient) made sequentially can accumulate network latency. Unlike database calls using SQLAlchemy AsyncSession which are not thread-safe, external HTTP requests have no concurrency restrictions.
**Action:** Use `asyncio.gather` to execute independent external API calls concurrently to reduce overall wait time and improve service performance.
