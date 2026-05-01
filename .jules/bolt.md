## 2024-05-01 - Parallelizing Independent External API Calls
**Learning:** Sequential `await` statements for independent HTTP requests (like Eventbrite and Google Places) create unnecessary latency accumulation. While SQLAlchemy `AsyncSession` restricts concurrent database calls, independent external API calls using `httpx.AsyncClient` have no such restriction and should be parallelized.
**Action:** Use `asyncio.gather` for independent external API requests to fetch data concurrently.
