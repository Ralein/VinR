## 2024-04-10 - Parallelize independent external API requests
**Learning:** While database queries via `AsyncSession` in SQLAlchemy are restricted from concurrent execution because they are not thread-safe, independent external HTTP requests (e.g., via `httpx.AsyncClient`) do not share this limitation.
**Action:** When making multiple external API calls that do not depend on each other, use `asyncio.gather` to execute them concurrently instead of sequentially to reduce overall latency.
