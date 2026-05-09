## 2023-10-27 - Parallelizing Independent API Calls in Backend
**Learning:** While SQLAlchemy AsyncSession restricts concurrent database execution using `asyncio.gather` on the same session, independent external HTTP requests (e.g., using `httpx.AsyncClient`) do not share this limitation.
**Action:** Always identify independent external API calls (like Google Places and Eventbrite search) and parallelize them with `asyncio.gather` to significantly reduce request latency, ensuring not to mix database operations in the same concurrency block.
