## 2024-05-18 - Optimized get_summary

**Learning:** Backend database operations use SQLAlchemy AsyncSession, which is not thread-safe and does not support concurrent execution (e.g., via asyncio.gather).
**Action:** Batch independent queries using single select statements with scalar subqueries.
