## 2024-07-19 - Optimize Independent External HTTP Requests
**Learning:** Sequential execution of independent external API calls (like Google Places and Eventbrite) creates an unnecessary N+1 bottleneck, accumulating network latency. Since independent HTTP requests do not share database session state, they can be safely run in parallel.
**Action:** When a function requires data from multiple independent external sources, use `asyncio.gather` to execute the HTTP requests concurrently and minimize total response latency.
