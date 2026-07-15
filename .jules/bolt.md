
## 2024-05-18 - Parallelizing external API calls with asyncio
**Learning:** While SQLAlchemy `AsyncSession` does not support concurrent execution (like `asyncio.gather`), independent external HTTP requests (such as fetching data from Google Places and Eventbrite via `httpx`) are fully safe to run concurrently.
**Action:** Always identify independent IO-bound operations (like multiple third-party API calls) and run them concurrently with `asyncio.gather` instead of awaiting them sequentially to significantly reduce total network latency.
