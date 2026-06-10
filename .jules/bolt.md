## 2024-06-10 - Concurrent External API Fetching
**Learning:** Sequential await statements for external independent APIs (e.g., Google Places and Eventbrite) create an unnecessary N+1 latency bottleneck. Wait times sum up instead of parallelizing.
**Action:** When gathering data from multiple independent external services, always execute them concurrently using `asyncio.gather` to reduce the latency bounded to the slowest API instead of the sum of both.
