
## 2024-05-18 - Optimize Independent HTTP Requests with Concurrency
**Learning:** External API requests (like Google Places and Eventbrite) that do not depend on each other are prime candidates for concurrent execution. While SQLAlchemy limits concurrent DB queries, `httpx` and `asyncio.gather` allow us to overlap network wait times.
**Action:** Always identify independent asynchronous I/O operations and execute them concurrently with `asyncio.gather` rather than using sequential `await`s.
