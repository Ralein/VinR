## 2023-10-27 - [Initial]
**Learning:** Initial setup
**Action:** Ready to optimize

## 2023-10-27 - [Concurrent API Requests]
**Learning:** Found sequential independent HTTP requests (`_search_google_places` and `_search_eventbrite`) being made to external APIs, which accumulates network latency.
**Action:** Always use `asyncio.gather` for independent external HTTP requests (e.g., via httpx.AsyncClient) to parallelize them and reduce overall latency. This doesn't share the same limitation as SQLAlchemy AsyncSession which restricts concurrent execution for database calls.
