## 2024-04-18 - Batching Independent Network Requests
**Learning:** While SQLAlchemy `AsyncSession` restricts concurrent database operations, independent external HTTP requests (e.g., calling Eventbrite and Google Places APIs) do not share this limitation.
**Action:** Use `asyncio.gather` to parallelize multiple independent I/O-bound requests instead of awaiting them sequentially to significantly reduce the overall response latency.
