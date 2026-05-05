## 2024-05-05 - Event Search Latency Optimization
**Learning:** Sequential await calls for independent external APIs (`Google Places`, `Eventbrite`) create a bottleneck equal to the sum of their latencies.
**Action:** Use `asyncio.gather()` to fetch data from independent data sources concurrently, reducing the total network request latency from `sum(latencies)` to `max(latencies)`.
