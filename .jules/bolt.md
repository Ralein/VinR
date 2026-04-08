## 2025-03-05 - Batching Independent AsyncSession Queries
**Learning:** SQLAlchemy's `AsyncSession` does not support concurrent execution (e.g., via `asyncio.gather`), meaning independent queries run sequentially and compound network latency (N+1-like behavior on a single endpoint).
**Action:** Always batch independent aggregated/scalar queries into a single `select()` using `scalar_subquery()` to reduce database round trips.
