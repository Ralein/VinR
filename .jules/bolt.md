
## 2024-05-18 - Concurrent API calls in events_service.py
**Learning:** `asyncio.gather` can safely parallelize external independent HTTP requests to reduce wait times from accumulating, whereas `AsyncSession` cannot be parallelized safely.
**Action:** When multiple independent endpoints must be hit in a single service layer function without database transaction involvement, wrap them in `asyncio.gather` rather than sequential awaits.
