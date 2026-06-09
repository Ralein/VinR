
## 2024-05-18 - [Parallelize External API Requests]
**Learning:** External API requests that don't depend on each other (like hitting Google Places and Eventbrite simultaneously) can be executed in parallel using `asyncio.gather` instead of awaiting them sequentially.
**Action:** Always look for independent `await` calls that can be batched using `asyncio.gather` to reduce total latency from O(A + B) to O(max(A, B)).
