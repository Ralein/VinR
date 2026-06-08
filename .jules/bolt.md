## 2024-06-08 - Concurrent API fetching in Events Service
**Learning:** External API requests in `search_events` (Google Places and Eventbrite) were being executed sequentially despite being independent, causing the latency to be the sum of both requests. Since HTTP requests don't share the database connection restrictions of `AsyncSession`, they can be safely parallelized.
**Action:** Use `asyncio.gather` for independent external API calls to reduce total latency to the maximum of individual request latencies rather than their sum.
