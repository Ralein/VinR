
## 2024-10-27 - Parallelize independent external API requests
**Learning:** Sequential HTTP calls can significantly degrade overall response times, especially when aggregating data from multiple external sources (like Google Places and Eventbrite).
**Action:** Always identify independent, I/O-bound network calls within the same request lifecycle and parallelize them using `asyncio.gather()` to minimize total latency without impacting functional behavior.
