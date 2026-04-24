## 2024-04-24 - Parallelize independent external HTTP calls
**Learning:** In the backend, external HTTP requests (e.g., via httpx.AsyncClient) do not share the SQLAlchemy AsyncSession concurrency limitations and can be safely parallelized. Sequential awaits for independent API calls unnecessarily increase latency.
**Action:** Always use `asyncio.gather` for multiple independent external API calls (e.g., fetching from different providers) to reduce overall response time to the maximum of the individual latencies rather than their sum.
