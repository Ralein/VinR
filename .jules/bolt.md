## 2024-06-25 - Optimize event search with concurrent API requests
**Learning:** While SQLAlchemy `AsyncSession` cannot be parallelized in Python (limiting concurrent execution for database queries), independent external HTTP requests (e.g., using `httpx.AsyncClient`) do not share this limitation.
**Action:** Always identify opportunities to use `asyncio.gather` for independent external API requests (like fetching from Google Places and Eventbrite simultaneously) to reduce overall network latency.
