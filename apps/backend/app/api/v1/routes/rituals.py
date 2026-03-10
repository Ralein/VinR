"""Ritual routes — Morning and evening personalized content."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.rituals import MorningRitualResponse, EveningWindDownResponse
from app.services.ritual_service import get_morning_ritual, get_evening_winddown

router = APIRouter(prefix="/rituals", tags=["rituals"])


@router.get("/morning", response_model=MorningRitualResponse)
async def morning_ritual(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personalized morning ritual content."""
    user_id = current_user["sub"]
    return await get_morning_ritual(db, user_id)


@router.get("/evening", response_model=EveningWindDownResponse)
async def evening_winddown(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personalized evening wind-down content."""
    user_id = current_user["sub"]
    return await get_evening_winddown(db, user_id)
