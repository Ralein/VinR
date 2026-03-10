"""Pydantic schemas for events endpoints."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class EventResponse(BaseModel):
    """A single event from search results."""
    event_id: str
    name: str
    description: str | None = None
    venue: str | None = None
    address: str | None = None
    date: str | None = None  # Human-readable date string
    start_time: str | None = None
    category: str | None = None  # yoga, meditation, support-group, outdoor, art-therapy, social
    distance_miles: float | None = None
    url: str | None = None  # Deep link to Eventbrite/Meetup
    is_virtual: bool = False
    image_url: str | None = None


class EventSearchResponse(BaseModel):
    """Search results for events."""
    events: list[EventResponse]
    total: int
    cached: bool = False


class EventBookmarkCreate(BaseModel):
    """Bookmark an event."""
    event_id: str
    event_data: dict  # Full event payload for offline access


class EventBookmarkResponse(BaseModel):
    """Bookmarked event response."""
    id: UUID
    user_id: str
    event_id: str
    event_data: dict
    created_at: datetime

    model_config = {"from_attributes": True}
