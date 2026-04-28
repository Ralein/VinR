
## 2024-04-28 - Independent External HTTP Requests Can Be Parallelized
**Learning:** While SQLAlchemy `AsyncSession` cannot safely execute concurrent database queries due to lack of thread-safety, independent external HTTP requests (e.g., via `httpx.AsyncClient`) do not share this limitation.
**Action:** Always look for opportunities to parallelize independent external API calls using `asyncio.gather` to significantly reduce overall latency, as demonstrated in `events_service.py` where Google Places and Eventbrite searches were combined.
