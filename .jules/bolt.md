## 2026-07-20 - Concurrency in Event Search
**Learning:** Sequential HTTP requests in asyncio code add up latency.
**Action:** Use asyncio.gather for independent external API calls to execute them in parallel and reduce response time.
