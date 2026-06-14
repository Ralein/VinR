## 2024-06-14 - [Concurrent API requests in Events Service]
**Learning:** Sequential `await` statements on independent external HTTP requests (Google Places and Eventbrite) create a latency bottleneck where total wait time is the sum of both latencies.
**Action:** Use `asyncio.gather` to execute independent IO-bound tasks concurrently, significantly reducing overall API response latency.
