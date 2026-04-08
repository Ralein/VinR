## 2024-03-24 - Batching Independent Subqueries
**Learning:** In the backend, SQLAlchemy AsyncSession restrict concurrent executions for DB calls. When fetching multiple independent aggregate metrics (like in an analytics dashboard), doing `db.scalar` sequentially creates an N+1 roundtrip problem for the DB connection.
**Action:** Always batch independent counting/aggregation queries into a single `select` statement using `.scalar_subquery()` to convert them into a single database roundtrip, significantly reducing DB latency and application wait time.
