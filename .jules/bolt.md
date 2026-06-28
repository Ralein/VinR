
## 2024-06-28 - Parallelizing Independent External API Calls
**Learning:** Sequential execution of independent external HTTP requests (e.g., Google Places and Eventbrite APIs) inside `search_events` caused unnecessary network latency accumulation. While SQLAlchemy queries have restrictions on concurrent execution, external httpx calls do not share this limitation.
**Action:** Always use `asyncio.gather` for independent external HTTP requests in backend services to parallelize I/O operations and reduce overall response time.
