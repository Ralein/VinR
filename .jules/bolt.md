
## 2026-06-04 - Parallelize independent httpx requests
**Learning:** This codebase tends to have sequential `await` calls for external APIs (like Google Places and Eventbrite). Since external HTTP requests using `httpx` don't share the concurrency limitations of SQLAlchemy sessions, fetching them sequentially creates an unnecessary performance bottleneck and accumulates network latency.
**Action:** Always look for opportunities to parallelize independent external API requests using `asyncio.gather`.
