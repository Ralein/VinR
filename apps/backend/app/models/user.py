"""User ORM model."""

from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(255), primary_key=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    password_reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    password_reset_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    age: Mapped[str | None] = mapped_column(String(50), nullable=True)
    primary_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    relaxation_methods: Mapped[list | None] = mapped_column(JSON, nullable=True)
    personalization_preferences: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    # Relationships
    checkins = relationship("Checkin", back_populates="user", lazy="selectin")
    streaks = relationship("Streak", back_populates="user", lazy="selectin")
    push_tokens = relationship("PushToken", back_populates="user", lazy="selectin")
    notification_preferences = relationship(
        "NotificationPreferences", back_populates="user", uselist=False, lazy="selectin"
    )
    journal_entries = relationship("JournalEntry", back_populates="user", lazy="selectin")
