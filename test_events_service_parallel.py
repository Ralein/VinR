import asyncio
import sys

# Mock settings and httpx to test the logic
import builtins
class MockSettings:
    GOOGLE_PLACES_API_KEY = "test_key"
    EVENTBRITE_API_KEY = "test_key"
    DATABASE_URL = "test"
    SECRET_KEY = "test"
    REDIS_URL = "test"
    SMTP_PASSWORD = "test"
    GROQ_API_KEY = "test"
    YOUTUBE_API_KEY = "test"
    youtube_api_key2 = "test"

import sys
from types import ModuleType

# Create mock module for app.core.config
app_core_config = ModuleType("app.core.config")
def get_settings():
    return MockSettings()
app_core_config.get_settings = get_settings
sys.modules["app.core.config"] = app_core_config

class MockResponse:
    def json(self):
        return {"status": "OK", "results": [{"name": "Mock Place", "geometry": {"location": {"lat": 1, "lng": 1}}}], "events": [{"name": {"text": "Mock Event"}}]}

class AsyncClientContext:
    def __init__(self, *args, **kwargs):
        pass
    async def __aenter__(self):
        return self
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass
    async def get(self, *args, **kwargs):
        # Simulate network latency
        await asyncio.sleep(0.1)
        return MockResponse()

import httpx
httpx.AsyncClient = AsyncClientContext

try:
    from app.services.events_service import search_events, _search_google_places, _search_eventbrite
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)

async def test_search_events_parallel():
    import time

    start = time.time()
    results = await search_events(37.7749, -122.4194)
    end = time.time()

    duration = end - start
    print(f"Search events duration: {duration:.3f}s")
    print(f"Results count: {len(results)}")

    # Due to concurrent execution (asyncio.gather),
    # it should take roughly 0.1s instead of 0.2s
    if duration > 0.15:
        print("Test failed: Execution was not concurrent!")
        sys.exit(1)

    print("Test passed: Execution was concurrent!")

if __name__ == "__main__":
    asyncio.run(test_search_events_parallel())
