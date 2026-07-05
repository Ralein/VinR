## 2024-05-18 - Concurrent External API Requests
**Learning:** In FastAPI/async applications, independent external HTTP requests (e.g., via `httpx.AsyncClient`) can and should be parallelized using `asyncio.gather` to reduce latency. While SQLAlchemy AsyncSession restricts concurrent execution for database calls, this limitation does not apply to isolated HTTP requests.
**Action:** Always inspect sequential `await` statements involving external network calls and wrap them in `asyncio.gather` when their results are independent of one another.
