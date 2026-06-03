## 2026-06-03 - Sequential External API Calls Bottleneck
**Learning:** The backend executed independent external HTTP requests (Google Places and Eventbrite) sequentially, accumulating latency. While SQLAlchemy `AsyncSession` restricts concurrent database calls, independent HTTP requests via `httpx.AsyncClient` do not share this limitation and should be parallelized.
**Action:** Always use `asyncio.gather` to parallelize independent external API requests in the same request context to reduce total response latency to the maximum of the individual latencies, rather than their sum.
