import asyncio
from app.services.events_service import search_events

async def main():
    events = await search_events(37.7749, -122.4194, 25, "wellness")
    print(f"Found {len(events)} events")

if __name__ == "__main__":
    asyncio.run(main())
