## 2026-05-28 - [Optimize Event Service Search]
**Learning:** Independent external HTTP requests in backend services should be executed concurrently (e.g., using `asyncio.gather`) rather than sequentially to reduce network latency and prevent I/O bottlenecks.
**Action:** Always verify if independent tasks, particularly network-bound operations like API calls, can be run in parallel instead of executing sequentially.
