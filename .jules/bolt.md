## 2024-05-16 - [Concurrent API requests optimization in FastAPI]
**Learning:** Using `asyncio.gather` for independent external API requests (like fetching from Google Places and Eventbrite) is a critical optimization pattern in this codebase. Sequential `await` calls sum the latencies, whereas `asyncio.gather` reduces the total latency to the slowest request.
**Action:** Always look for sequential network I/O requests in service modules and parallelize them using `asyncio.gather` if they do not depend on each other.
