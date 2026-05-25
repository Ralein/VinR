## 2024-05-24 - Parallelize independent external HTTP requests
**Learning:** In `events_service.py`, `_search_google_places` and `_search_eventbrite` were executed sequentially, causing total latency to equal the sum of both API response times. Since these are independent external HTTP requests, they do not share the concurrent-safe limitations of SQLAlchemy AsyncSession.
**Action:** When making multiple independent external API calls, use `asyncio.gather()` to execute them concurrently, significantly reducing total execution time.
