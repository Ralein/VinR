## 2025-04-08 - Parallelize HTTP requests with asyncio.gather
**Learning:** While SQLAlchemy AsyncSession does not support concurrent execution for database calls due to threading limitations, independent external HTTP requests (e.g., via httpx.AsyncClient) do not share this restriction.
**Action:** Use `asyncio.gather` for independent external API calls to execute them concurrently, bringing overall network latency down from the sum of delays to the maximum of delays.
