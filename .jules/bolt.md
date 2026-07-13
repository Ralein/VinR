## 2026-07-13 - Parallelize API calls in events_service.py
**Learning:** Sequential async external API calls (Google Places, Eventbrite) compound latency unnecessarily, especially when they are independent and do not rely on shared connection pools like SQLAlchemy.
**Action:** Use `asyncio.gather` for independent external API fetches in the backend to minimize user latency.
