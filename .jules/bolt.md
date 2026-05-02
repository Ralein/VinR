
## 2024-05-02 - Parallelize Independent External API Calls
**Learning:** External API requests made via `httpx.AsyncClient` do not share the concurrency restrictions of database queries executed via SQLAlchemy's `AsyncSession`. While `AsyncSession` calls must be serialized (or batched using scalar subqueries), independent HTTP requests are safe to parallelize.
**Action:** Use `asyncio.gather` for independent external HTTP requests (e.g., retrieving data from different sources like Google Places and Eventbrite) to reduce total request latency from the sum of the times to the max of the times.
