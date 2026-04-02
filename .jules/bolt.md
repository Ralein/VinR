
## 2026-04-02 - Batched Database Aggregate Queries
**Learning:** SQLAlchemy's `AsyncSession` explicitly forbids concurrent queries on the same session using `asyncio.gather`. To optimize multiple independent aggregate queries (like counts/sums), do not attempt to run them concurrently. Instead, batch them into a single roundtrip using `scalar_subquery()` inside a single `select()` statement.
**Action:** Next time I need to fetch multiple independent scalar metrics from different tables for a single entity, I will construct a single SQL query using `scalar_subquery()` rather than executing separate `await db.scalar(...)` calls.
