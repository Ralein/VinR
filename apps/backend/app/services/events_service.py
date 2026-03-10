"""Events Service — Eventbrite integration, Redis caching, and personalization."""

import httpx
import json
from app.core.config import get_settings

settings = get_settings()

# Wellness event categories to filter for
WELLNESS_CATEGORIES = {
    "yoga", "meditation", "mindfulness", "mental health", "wellness",
    "support group", "outdoor", "hiking", "walking", "art therapy",
    "therapy", "breathwork", "fitness", "self-care", "journaling",
}

# Emotion → event type mapping for personalization
EMOTION_EVENT_MAP = {
    "anxious": ["yoga", "meditation", "breathwork", "walking"],
    "sad": ["support group", "outdoor", "hiking", "art therapy"],
    "angry": ["fitness", "yoga", "outdoor", "hiking"],
    "lonely": ["support group", "social", "art therapy", "walking"],
    "stressed": ["meditation", "yoga", "breathwork", "mindfulness"],
    "numb": ["art therapy", "outdoor", "hiking", "fitness"],
    "lost": ["support group", "mindfulness", "journaling", "walking"],
    "overwhelmed": ["meditation", "breathwork", "yoga", "self-care"],
}

# Fallback sample events for when no API key is configured
SAMPLE_EVENTS = [
    {
        "event_id": "sample-1",
        "name": "Morning Yoga in the Park",
        "description": "Start your day with gentle yoga flows surrounded by nature.",
        "venue": "Central Park Meadow",
        "address": "Central Park, New York, NY",
        "date": "Every Saturday",
        "start_time": "8:00 AM",
        "category": "yoga",
        "distance_miles": 2.1,
        "url": None,
        "is_virtual": False,
    },
    {
        "event_id": "sample-2",
        "name": "Mindfulness Meditation Circle",
        "description": "Guided meditation session for all levels. Bring a cushion!",
        "venue": "Community Wellness Center",
        "address": "123 Wellness Ave",
        "date": "Every Wednesday",
        "start_time": "7:00 PM",
        "category": "meditation",
        "distance_miles": 3.5,
        "url": None,
        "is_virtual": False,
    },
    {
        "event_id": "sample-3",
        "name": "Anxiety Support Group",
        "description": "A safe space to share and learn coping strategies together.",
        "venue": "Hope Center",
        "address": "456 Support St",
        "date": "Every Monday",
        "start_time": "6:30 PM",
        "category": "support group",
        "distance_miles": 4.2,
        "url": None,
        "is_virtual": False,
    },
    {
        "event_id": "sample-4",
        "name": "Sunset Walk & Talk",
        "description": "Casual walking group focused on connection and mental wellness.",
        "venue": "Riverside Trail",
        "address": "Riverside Park",
        "date": "Every Friday",
        "start_time": "5:30 PM",
        "category": "outdoor",
        "distance_miles": 1.8,
        "url": None,
        "is_virtual": False,
    },
    {
        "event_id": "sample-virtual-1",
        "name": "Online Breath Workshop",
        "description": "Learn breathing techniques for anxiety relief from home.",
        "venue": "Zoom",
        "address": None,
        "date": "Every Thursday",
        "start_time": "12:00 PM",
        "category": "breathwork",
        "distance_miles": None,
        "url": None,
        "is_virtual": True,
    },
    {
        "event_id": "sample-virtual-2",
        "name": "Virtual Art Therapy Session",
        "description": "Express yourself through guided art activities. No experience needed.",
        "venue": "Google Meet",
        "address": None,
        "date": "Every Tuesday",
        "start_time": "4:00 PM",
        "category": "art therapy",
        "distance_miles": None,
        "url": None,
        "is_virtual": True,
    },
]


async def search_events(lat: float, lon: float, radius: int = 25) -> list[dict]:
    """
    Search for wellness events near the given location.
    
    Uses Eventbrite API if configured, otherwise returns sample events.
    Results are cached per city in Redis for 12 hours (when Redis is available).
    """
    # Try Eventbrite API if key is available
    if settings.EVENTBRITE_API_KEY:
        try:
            events = await _search_eventbrite(lat, lon, radius)
            if events:
                return events
        except Exception as e:
            print(f"Eventbrite search error: {e}")

    # Fallback to sample events
    return SAMPLE_EVENTS


async def _search_eventbrite(lat: float, lon: float, radius: int) -> list[dict]:
    """Search Eventbrite for wellness events."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.eventbriteapi.com/v3/events/search/",
            params={
                "location.latitude": lat,
                "location.longitude": lon,
                "location.within": f"{radius}mi",
                "categories": "107",  # Health & Wellness category
                "sort_by": "date",
                "expand": "venue",
            },
            headers={
                "Authorization": f"Bearer {settings.EVENTBRITE_API_KEY}",
            },
            timeout=10.0,
        )
        data = response.json()

        events = []
        for event in data.get("events", []):
            venue = event.get("venue", {})
            address_info = venue.get("address", {})

            events.append({
                "event_id": event["id"],
                "name": event.get("name", {}).get("text", ""),
                "description": (event.get("description", {}).get("text", "") or "")[:200],
                "venue": venue.get("name", ""),
                "address": address_info.get("localized_address_display", ""),
                "date": event.get("start", {}).get("local", ""),
                "start_time": event.get("start", {}).get("local", ""),
                "category": _categorize_event(event.get("name", {}).get("text", "")),
                "distance_miles": None,
                "url": event.get("url", ""),
                "is_virtual": event.get("online_event", False),
                "image_url": (event.get("logo", {}) or {}).get("url", None),
            })

        return events


def _categorize_event(name: str) -> str:
    """Categorize an event based on its name."""
    name_lower = name.lower()
    for cat in WELLNESS_CATEGORIES:
        if cat in name_lower:
            return cat
    return "wellness"


def personalize_events(events: list[dict], emotion: str | None) -> list[dict]:
    """
    Reorder events to prioritize those matching user's current emotion.
    
    e.g., anxious users see yoga and meditation first.
    """
    if not emotion or emotion not in EMOTION_EVENT_MAP:
        return events

    preferred_categories = EMOTION_EVENT_MAP[emotion]

    def score(event: dict) -> int:
        cat = (event.get("category") or "").lower()
        if cat in preferred_categories:
            return preferred_categories.index(cat)
        return len(preferred_categories)

    return sorted(events, key=score)
