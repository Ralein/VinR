## 2024-05-18 - [Optimizing Concurrent HTTP Requests in Event Service]
**Learning:** Using `asyncio.gather` on independent external HTTP requests (e.g., `_search_google_places` and `_search_eventbrite`) reduces overall latency from `O(A + B)` to `O(max(A, B))` compared to awaiting them sequentially. Unlike database calls with SQLAlchemy `AsyncSession`, standard HTTP requests are concurrent-safe.
**Action:** Always check sequential `await` calls that don't depend on each other's results, and parallelize them via `asyncio.gather` for immediate I/O performance wins.
