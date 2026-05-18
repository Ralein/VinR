## 2026-05-18 - [Parallelize External API Calls in Event Service]
**Learning:** Sequential execution of independent external API calls (e.g., Google Places and Eventbrite) creates a cumulative performance bottleneck, where the total waiting time is the sum of both response times.
**Action:** Use `asyncio.gather` to parallelize independent network requests within async functions to reduce the total latency to the maximum of the individual request times, rather than their sum.
