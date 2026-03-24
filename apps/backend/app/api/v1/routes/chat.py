"""VinR Buddy chat routes."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.chat_service import (
    get_chat_history,
    save_message,
    clear_chat_history,
    generate_buddy_response,
)
from app.services.elevenlabs_service import text_to_speech, audio_bytes_to_data_uri

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Request / Response schemas ───────────────────────────────────────

class SendMessageRequest(BaseModel):
    text: str
    voice_enabled: bool = False


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    audio_url: str | None = None
    created_at: str


class SendMessageResponse(BaseModel):
    user_message: ChatMessageResponse
    buddy_message: ChatMessageResponse


# ── Routes ───────────────────────────────────────────────────────────

@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to VinR Buddy and get a response."""
    user_id = current_user["sub"]

    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Save user message
    user_msg = await save_message(db, user_id, "user", request.text.strip())

    # Generate buddy response
    buddy_text = await generate_buddy_response(db, user_id, request.text.strip())

    # Optional: generate voice
    audio_url = None
    if request.voice_enabled:
        audio_bytes = await text_to_speech(buddy_text)
        if audio_bytes:
            audio_url = audio_bytes_to_data_uri(audio_bytes)

    # Save buddy message
    buddy_msg = await save_message(
        db, user_id, "assistant", buddy_text, audio_url=audio_url,
    )

    return SendMessageResponse(
        user_message=ChatMessageResponse(
            id=str(user_msg.id),
            role=user_msg.role,
            content=user_msg.content,
            audio_url=user_msg.audio_url,
            created_at=user_msg.created_at.isoformat(),
        ),
        buddy_message=ChatMessageResponse(
            id=str(buddy_msg.id),
            role=buddy_msg.role,
            content=buddy_msg.content,
            audio_url=buddy_msg.audio_url,
            created_at=buddy_msg.created_at.isoformat(),
        ),
    )


@router.get("/history")
async def get_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch conversation history for the current user."""
    user_id = current_user["sub"]
    messages = await get_chat_history(db, user_id, limit=50)

    return {
        "messages": [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "audio_url": msg.audio_url,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ]
    }


@router.delete("/history")
async def delete_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clear all conversation history for the current user."""
    user_id = current_user["sub"]
    count = await clear_chat_history(db, user_id)
    return {"deleted": count, "message": "Conversation cleared"}
