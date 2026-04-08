## 2026-04-05 - SQLAlchemy AsyncSession Concurrency Limitation
**Learning:** `SQLAlchemy AsyncSession` does not support `asyncio.gather` for concurrent database queries because it is not thread-safe. Attempting to run multiple queries concurrently using the same session will result in errors.
**Action:** Always batch independent queries into a single `select()` statement using `scalar_subquery()` to reduce database round-trips when reading multiple independent statistics or counts, instead of making multiple sequential `await db.scalar()` calls.
