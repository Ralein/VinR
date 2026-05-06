## 2026-05-06 - [Parallelizing independent API calls]
**Learning:** Utilizing `asyncio.gather` allows for parallel execution of independent external HTTP requests within an asynchronous service layer context, effectively cutting overall wait time significantly compared to sequentially awaiting them. This holds true as long as those calls do not share restricted resources such as a single SQLAlchemy `AsyncSession`.
**Action:** Consistently search for sequential network I/O operations and employ `asyncio.gather` (or similar mechanisms) where safe to parallelize API interactions.
