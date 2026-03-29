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
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from app.services.audio_service import transcribe_audio_whisper

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Request / Response schemas ───────────────────────────────────────

class SendMessageRequest(BaseModel):
    text: str
    voice_enabled: bool = False
    persona: str = "sara"  # Default persona


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    audio_url: str | None = None
    persona: str | None = None
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

    # Check for /voice command or voice_enabled flag
    is_voice = request.voice_enabled or request.text.strip().startswith("/voice")
    clean_text = request.text.strip()
    if clean_text.startswith("/voice"):
        clean_text = clean_text.replace("/voice", "", 1).strip()

    if not clean_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Save user message
    user_msg = await save_message(
        db, user_id, "user", clean_text, persona=request.persona
    )

    # Generate buddy response
    buddy_text = await generate_buddy_response(
        db, user_id, clean_text, persona=request.persona
    )

    # Optional: generate voice
    audio_url = None
    if is_voice:
        # Get persona voice ID
        from app.services.elevenlabs_service import PERSONA_VOICES
        voice_id = PERSONA_VOICES.get(request.persona)

        audio_bytes = await text_to_speech(buddy_text, voice_id=voice_id)
        if audio_bytes:
            audio_url = audio_bytes_to_data_uri(audio_bytes)

    # Save buddy message
    buddy_msg = await save_message(
        db, user_id, "assistant", buddy_text,
        audio_url=audio_url, persona=request.persona,
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


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
):
    """Voice to text using Groq Whisper."""
    try:
        content = await file.read()
        text = await transcribe_audio_whisper(content, filename=file.filename)
        if not text:
            raise HTTPException(status_code=400, detail="Transcription failed")
        return {"text": text}
    except Exception as e:
        print(f"⚠️ Transcribe route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
