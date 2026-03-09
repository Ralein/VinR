"""Check-in and Plan Pydantic schemas."""

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class ReliefItem(BaseModel):
    """A single immediate relief or daily habit technique."""
    id: str
    name: str
    emoji: str
    category: str  # breathing|grounding|movement|meditation|social|creative
    duration: str
    instructions: list[str]
    science_note: str = Field(alias="scienceNote", default="")
    source: str = ""

    model_config = {"populate_by_name": True}


class CheckinRequest(BaseModel):
    mood_tag: str
    text: str | None = None


class PlanResponse(BaseModel):
    """Complete AI-generated plan response."""
    is_emergency: bool = Field(alias="isEmergency", default=False)
    primary_emotion: str = Field(alias="primaryEmotion", default="")
    emotion_summary: str = Field(alias="emotionSummary", default="")
    support_message: str = Field(alias="supportMessage", default="")
    immediate_relief: list[ReliefItem] = Field(alias="immediateRelief", default_factory=list)
    daily_habits: list[ReliefItem] = Field(alias="dailyHabits", default_factory=list)
    affirmation: str = ""
    gratitude_prompt: str = Field(alias="gratitudePrompt", default="")
    therapist_note: str = Field(alias="therapistNote", default="")

    model_config = {"populate_by_name": True}


class CheckinResponse(BaseModel):
    """Full check-in response with plan and streak info."""
    checkin_id: UUID
    plan: PlanResponse
    streak_id: UUID | None = None
    current_streak: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
