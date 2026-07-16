## 2024-07-16 - Concurrent Event API Requests
**Learning:** In Python web applications using `asyncio`, executing multiple independent external HTTP API calls sequentially causes latency to accumulate additively. In `apps/backend/app/services/events_service.py`, `_search_google_places` and `_search_eventbrite` were executed sequentially.
**Action:** Use `asyncio.gather` to fetch from independent API endpoints concurrently, significantly reducing overall request latency.
