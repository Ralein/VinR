## 2024-04-01 - Optimizing database queries
**Learning:** In FastAPI/SQLAlchemy applications, N+1 query problems are common when calculating analytics or summaries. Multiple consecutive `await db.scalar()` calls for aggregates like counts or sums can add significant latency due to repeated network round-trips to the database.
**Action:** Combine consecutive independent aggregation queries using scalar subqueries (`.scalar_subquery().label('...')`) within a single `select()` to fetch everything in one network round-trip, significantly improving performance.
