## 2024-07-04 - [Parallelize External API Calls in Event Search]
**Learning:** Independent external HTTP requests (e.g., Google Places and Eventbrite API calls) do not share the concurrent execution limitation of SQLAlchemy AsyncSession. While AsyncSession restricts concurrency, network calls via httpx.AsyncClient should be parallelized using asyncio.gather to reduce latency and avoid cumulative wait times.
**Action:** When making multiple independent API calls in the backend, always use `asyncio.gather` instead of awaiting them sequentially to optimize performance.
