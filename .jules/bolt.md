
## 2024-05-18 - Parallelize Independent External API Calls
**Learning:** External API requests using `httpx.AsyncClient` are not bound by the concurrency limitations of SQLAlchemy's `AsyncSession`. Therefore, multiple external HTTP calls (like checking Eventbrite and Google Places) can be safely parallelized using `asyncio.gather` without triggering thread safety or concurrent connection pool issues. This drastically cuts down function latency.
**Action:** When working on services that aggregate data from multiple external sources, always check for sequential `await` statements and optimize them with `asyncio.gather` as long as there is no dependency between the calls and no shared SQLAlchemy session being mutated simultaneously.
