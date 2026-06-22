
## 2026-06-22 - [Optimize Eventbrite and Google Places search]
**Learning:** Independent external HTTP requests in Python's async contexts can run sequentially and accumulate latency. In this codebase's architecture, caching these calls might mitigate subsequent impacts, but the initial response inherently takes the sum of the request times.
**Action:** When making multiple external API calls (e.g., merging sources like Places and Eventbrite), always group them with `asyncio.gather` rather than using consecutive `await` statements, halving latency for cold paths.
