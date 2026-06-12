## 2025-01-20 - Parallelize Independent External API Calls
**Learning:** In `apps/backend/app/services/events_service.py`, the `search_events` function awaited Google Places and Eventbrite API calls sequentially. This unnecessarily doubles the total network latency because the calls are independent.
**Action:** Use `asyncio.gather` to execute independent external API calls concurrently to minimize response latency.
