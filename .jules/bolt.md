## 2024-06-24 - Parallelize independent API calls
**Learning:** Independent external HTTP requests in Python backend services (e.g., retrieving data from Google Places and Eventbrite simultaneously) do not share the SQLAlchemy `AsyncSession` limitations. Thus, they can be safely executed concurrently instead of sequentially to cut network latency accumulation.
**Action:** Always identify independent asynchronous I/O tasks and wrap them with `asyncio.gather` rather than awaiting them one by one.
