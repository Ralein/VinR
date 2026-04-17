
## 2026-04-17 - Parallelize External API Calls
**Learning:** Independent external HTTP requests in async Python can be parallelized with `asyncio.gather` to reduce overall latency, avoiding sequential blocking.
**Action:** Always check if multiple `await` calls in a row are independent and parallelize them.
