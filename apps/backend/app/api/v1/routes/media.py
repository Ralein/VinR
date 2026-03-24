"""Media routes — audio library, YouTube proxy, session logging."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.media import MediaSession
from app.schemas.media import (
    AudioLibraryResponse,
    AudioTrack,
    YouTubeSearchResponse,
    YouTubeResult,
    MediaSessionCreate,
    MediaSessionResponse,
)
from app.services.media_service import get_audio_library, search_youtube, search_youtube_reels

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/audio", response_model=AudioLibraryResponse)
async def get_audio_tracks(
    category: str = Query(
        ..., pattern=r"^(sleep|breathing|meditation|affirmation)$",
        description="Audio category: sleep, breathing, meditation, affirmation"
    ),
    current_user: dict = Depends(get_current_user),
):
    """Get audio tracks for a specific category."""
    tracks = await get_audio_library(category)
    audio_tracks = [AudioTrack(category=category, **t) for t in tracks]
    return AudioLibraryResponse(category=category, tracks=audio_tracks)


@router.get("/youtube", response_model=YouTubeSearchResponse)
async def youtube_search(
    genre: str = Query(..., description="Music genre (Pop, R&B, etc.)"),
    type: str = Query("music", pattern=r"^(music|motivation)$", description="Content type"),
    current_user: dict = Depends(get_current_user),
):
    """Search YouTube for curated content based on user's genre preference."""
    results = await search_youtube(genre, type)
    youtube_results = [YouTubeResult(**r) for r in results]
    return YouTubeSearchResponse(genre=genre, content_type=type, results=youtube_results)


@router.get("/glint")
async def get_glint(
    primary_reason: str = Query("Stress Relief", description="User's primary reason for using VinR"),
    current_user: dict = Depends(get_current_user),
):
    """Get curated YouTube shorts/reels based on user's primary wellness reason."""
    # We could also use user.primaryReason if we load user from DB. 
    # Passing it via query param is simpler for now, similar to how /youtube takes genre.
    results = await search_youtube_reels(primary_reason, max_results=10)
    
    # Format the results to match what we need in the feed (we can reuse YouTubeResult or return a raw structure)
    # We will just return a dict with a list of reels
    return {"glints": results}


@router.post("/session", response_model=MediaSessionResponse)
async def log_media_session(
    request: MediaSessionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log a media listening session for analytics."""
    user_id = current_user["sub"]

    session = MediaSession(
        user_id=user_id,
        media_type=request.media_type,
        media_id=request.media_id,
        duration_seconds=request.duration_seconds,
        completed=request.completed,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)

    return session
