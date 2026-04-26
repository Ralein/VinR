## 2024-04-26 - Asyncio.gather for Parallel External API Calls
**Learning:** Sequential HTTP requests to independent third-party services (e.g., Google Places and Eventbrite) create a significant latency bottleneck. While SQLAlchemy async database calls in this project can't be gathered due to session thread-safety constraints, external HTTP calls have no such limits.
**Action:** Always look for sequential `await`s on external HTTP calls or independent I/O tasks. Wrap them in `asyncio.gather` to reduce total execution time from sum(t1, t2) to max(t1, t2).
