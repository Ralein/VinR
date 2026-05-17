import asyncio
import time
from unittest.mock import patch
from app.services.events_service import search_events, _cache

async def mock_search_google(*args, **kwargs):
    await asyncio.sleep(1) # simulate 1s network latency
    return [{"event_id": "gp_1", "name": "Google Yoga", "category": "yoga"}]

async def mock_search_eventbrite(*args, **kwargs):
    await asyncio.sleep(1) # simulate 1s network latency
    return [{"event_id": "eb_1", "name": "Eventbrite Yoga", "category": "yoga"}]

async def main():
    _cache.clear()
    start_time = time.time()

    with patch("app.services.events_service._search_google_places", mock_search_google), \
         patch("app.services.events_service._search_eventbrite", mock_search_eventbrite):
        await search_events(lat=40.7128, lon=-74.0060, radius=25, keyword="yoga")

    duration = time.time() - start_time
    print(f"Original execution time: {duration:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(main())
