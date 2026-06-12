import asyncio
import time
from unittest.mock import patch
from app.services.events_service import search_events, _cache

async def mock_search(*args, **kwargs):
    await asyncio.sleep(1)
    return [{"name": "Mock Event", "category": "yoga"}]

async def main():
    _cache.clear()

    with patch('app.services.events_service._search_google_places', side_effect=mock_search), \
         patch('app.services.events_service._search_eventbrite', side_effect=mock_search):

        start = time.time()
        await search_events(37.7749, -122.4194, 25, "yoga")
        end = time.time()

        print(f"Time taken: {end - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())
