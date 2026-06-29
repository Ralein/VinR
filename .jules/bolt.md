## 2024-05-19 - Concurrent API Calls for External Services
**Learning:** While SQLAlchemy `AsyncSession` restricts concurrent database operations, independent external HTTP requests (e.g., fetching from Google Places and Eventbrite via `httpx.AsyncClient`) do not share this limitation. Executing them sequentially accumulates latency.
**Action:** Use `asyncio.gather` to execute independent external API calls concurrently, which significantly reduces the total response time for endpoints aggregating data from multiple external sources.
