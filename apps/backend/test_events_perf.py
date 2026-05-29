import asyncio
from app.services.events_service import search_events

async def test_search():
    # Calling the mock/cache path should work without actual API keys
    try:
        events = await search_events(37.7749, -122.4194)
        print("Events retrieved successfully:", len(events))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test_search())
