"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Global app settings loaded from environment variables."""

    # App
    APP_NAME: str = "VinR API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database (Neon PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@ep-xyz.us-east-2.aws.neon.tech/vinr_db?sslmode=require"
    DATABASE_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Auth
    SECRET_KEY: str = "vinr_super_secret_key_placeholder_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    FRONTEND_URL: str = "exp://localhost:8081" # Deep link for password reset

    # OAuth
    GOOGLE_CLIENT_ID: str = ""

    # SMTP for emails
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@vinrmobile.com"

    # Anthropic (Claude)
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"

    # Expo Push Notifications
    EXPO_PUSH_URL: str = "https://exp.host/--/api/v2/push/send"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "vinr-media"
    AWS_REGION: str = "us-east-1"

    # YouTube Data API v3
    YOUTUBE_API_KEY: str = ""

    # Events APIs
    EVENTBRITE_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:3000",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://127.0.0.1:3000",
    ]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
