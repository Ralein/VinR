import asyncio
import time
from unittest.mock import patch

from app.services.events_service import search_events
import app.services.events_service as events_service

async def mock_search_google(*args, **kwargs):
    await asyncio.sleep(2)
    return []

async def mock_search_eb(*args, **kwargs):
    await asyncio.sleep(2)
    return []

async def main():
    # clear cache if needed, though we run it once
    with patch.object(events_service, '_search_google_places', mock_search_google), \
         patch.object(events_service, '_search_eventbrite', mock_search_eb):
        start = time.time()
        await search_events(lat=34.0522, lon=-118.2437)
        end = time.time()
        print(f"search_events execution time: {end - start:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(main())
