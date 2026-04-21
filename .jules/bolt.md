## 2024-04-21 - Parallelize Independent External HTTP Requests
**Learning:** Sequential HTTP requests unnecessarily accumulate latency. Independent external API calls (unlike SQLAlchemy database queries which have session restrictions) can safely be parallelized using `asyncio.gather`.
**Action:** When making multiple non-dependent API calls (e.g., to different providers like Google Places and Eventbrite), use `asyncio.gather` instead of awaiting them sequentially to reduce total wait time from the sum to the maximum of the individual request latencies.
