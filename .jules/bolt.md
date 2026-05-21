## 2026-05-21 - Parallelize Independent API Calls with asyncio.gather
**Learning:** Sequential execution of independent asynchronous operations (like calling Google Places API and Eventbrite API one after another) introduces a significant performance bottleneck by accumulating network latencies.
**Action:** Always use `asyncio.gather` to run independent network or I/O-bound coroutines concurrently. This reduces the total execution time to roughly the duration of the slowest single operation rather than the sum of all operations.
