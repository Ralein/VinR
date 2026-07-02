## 2026-07-02 - Parallelizing external API calls with asyncio.gather
**Learning:** In asynchronous Python backend services, multiple independent external HTTP calls should not be awaited sequentially. Sequentially awaiting requests introduces an O(A+B) latency bottleneck (where total wait time is the sum of all individual response times).
**Action:** When making multiple independent I/O-bound requests (such as querying different 3rd-party APIs), use `asyncio.gather` to run them concurrently. This reduces total latency to O(max(A, B)), effectively masking the latency of the faster requests.
