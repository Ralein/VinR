"""Notification routes — push token registration."""

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.push_token import PushToken

router = APIRouter(prefix="/notifications", tags=["notifications"])


class RegisterTokenRequest(BaseModel):
    token: str
    platform: str  # ios, android


@router.post("/register-token")
async def register_push_token(
    request: RegisterTokenRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register or update a push notification token for the current user."""
    user_id = current_user["sub"]

    # Deactivate old tokens for this user on same platform
    await db.execute(
        update(PushToken)
        .where(PushToken.user_id == user_id, PushToken.platform == request.platform)
        .values(active=False)
    )

    # Register new token
    push_token = PushToken(
        user_id=user_id,
        token=request.token,
        platform=request.platform,
        active=True,
    )
    db.add(push_token)

    return {"success": True}
