"""User Pydantic schemas."""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    avatar_url: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    music_genre: str | None = None
    preferred_language: str | None = None
    timezone: str | None = None
    onboarding_complete: bool | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None
    avatar_url: str | None
    onboarding_complete: bool
    music_genre: str | None
    preferred_language: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}
