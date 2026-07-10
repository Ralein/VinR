## 2024-07-10 - Parallelize independent API requests
**Learning:** In the backend `events_service.py`, independent HTTP requests using `httpx.AsyncClient` can and should be parallelized with `asyncio.gather` to avoid network latency accumulation. This is fundamentally different from the database access layer where SQLAlchemy `AsyncSession` explicitly prohibits concurrent execution.
**Action:** Always check sequential `await` statements involving external network calls (e.g., API requests) to see if they can be safely gathered.
