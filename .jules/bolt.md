## 2024-04-30 - [Parallelizing External HTTP API Requests]
**Learning:** Sequential execution of independent external HTTP requests (like Google Places and Eventbrite API calls) leads to additive latency, creating a significant performance bottleneck in downstream handlers.
**Action:** Always use `asyncio.gather` for independent network-bound API calls to parallelize them and bound the total latency by the slowest single request, instead of the sum of all requests.
