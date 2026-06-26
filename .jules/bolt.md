## 2024-10-25 - [Title: Optimize Latency for External HTTP Requests]
**Learning:** In scenarios involving multiple independent external HTTP requests (e.g., querying two APIs for event discovery), sequential execution introduces unnecessary latency.
**Action:** Use `asyncio.gather()` to run these independent requests concurrently, which significantly speeds up the total response time without introducing complexities, provided the database sessions are not shared.
