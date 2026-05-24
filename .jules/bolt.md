## 2024-05-15 - Concurrent HTTP Requests
**Learning:** While SQLAlchemy AsyncSession restricts concurrent execution for database calls, independent external HTTP requests (e.g., via httpx.AsyncClient) do not share this limitation.
**Action:** Use asyncio.gather to parallelize independent external API requests (like fetching from Google Places and Eventbrite simultaneously) to reduce overall latency.
