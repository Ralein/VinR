## 2024-05-24 - Concurrent External API Calls
**Learning:** Independent external HTTP requests in async Python functions were being executed sequentially, causing compounding latency. While DB sessions limit concurrency, external network requests via `httpx` or similar tools do not share this limitation and can be safely parallelized.
**Action:** Use `asyncio.gather` for independent external API calls to minimize network latency bottlenecks. Ensure to verify if there are session constraints before parallelizing DB calls.
