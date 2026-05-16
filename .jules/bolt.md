## 2024-05-16 - Concurrency limits do not apply to external HTTP requests
**Learning:** While SQLAlchemy AsyncSession restricts concurrent execution for database calls, independent external HTTP requests (e.g., via httpx.AsyncClient like Google Places and Eventbrite API calls) do not share this limitation and should be parallelized using asyncio.gather to reduce latency.
**Action:** When making multiple external API calls that don't depend on each other, use asyncio.gather instead of awaiting them sequentially.
