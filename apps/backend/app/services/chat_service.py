"""Chat Service — VinR Buddy conversational AI with RAG + user context."""

import json
from openai import AsyncOpenAI
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import ChatMessage
from app.services.rag_service import retrieve_context
from app.services.adaptive_service import build_user_context
from app.core.config import get_settings

settings = get_settings()

# ── Buddy system prompt (conversational, not check-in analysis) ──────

BUDDY_SYSTEM_PROMPT = """You are VinR Buddy — a warm, emotionally intelligent AI companion.
You are NOT a therapist. You are a supportive friend who listens, validates,
and gently offers evidence-based wellness suggestions.

PERSONALITY:
- Warm, empathetic, and encouraging
- Uses the user's name when available
- Mirrors the user's energy: calm when they're anxious, upbeat when they're positive
- Never dismissive ("just relax"), always validating ("that sounds really tough")
- Asks thoughtful follow-up questions to show genuine interest
- Naturally uses calm emojis (🌿 🫧 🌙 ✨ 💛) but sparingly

GUIDELINES:
- Keep responses concise (2-4 sentences typically, unless depth is needed)
- Ground suggestions in evidence when the RAG context provides it
- If the user shares crisis language (suicidal thoughts, self-harm), immediately:
  • Validate their feelings
  • Share: "If you're in crisis, please text HOME to 741741 or call 988"
  • Encourage professional help
- Never diagnose or prescribe medication
- If unsure, say "I'm not sure, but here's what I know..."

You will receive conversation history for continuity. Use it to reference
previous topics and show you remember what the user shared.

Use the provided RAG context to ground your wellness suggestions.
Respond in plain text (no JSON), as a caring conversational partner."""


# ── Client setup ─────────────────────────────────────────────────────

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set.")
        _client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
    return _client


# ── DB operations ────────────────────────────────────────────────────

async def get_chat_history(
    db: AsyncSession, user_id: str, limit: int = 30,
) -> list[ChatMessage]:
    """Fetch recent chat messages for a user, oldest first."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = list(result.scalars().all())
    messages.reverse()  # oldest first for LLM context
    return messages


async def save_message(
    db: AsyncSession, user_id: str, role: str, content: str,
    audio_url: str | None = None,
) -> ChatMessage:
    """Persist a chat message."""
    msg = ChatMessage(
        user_id=user_id, role=role, content=content, audio_url=audio_url,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def clear_chat_history(db: AsyncSession, user_id: str) -> int:
    """Delete all chat messages for a user. Returns count deleted."""
    result = await db.execute(
        delete(ChatMessage).where(ChatMessage.user_id == user_id)
    )
    await db.commit()
    return result.rowcount


# ── Buddy response generation ───────────────────────────────────────

async def generate_buddy_response(
    db: AsyncSession, user_id: str, message: str,
) -> str:
    """
    Orchestrate: history + RAG + user context → Groq LLM → response.
    """
    # 1. Retrieve RAG context from knowledge base
    rag_context = await retrieve_context(message)

    # 2. Build adaptive user context (mood trend, streak, preferences)
    user_context = await build_user_context(db, user_id)

    # 3. Fetch conversation history for continuity
    history = await get_chat_history(db, user_id, limit=20)

    # 4. Build LLM messages
    llm_messages = [{"role": "system", "content": BUDDY_SYSTEM_PROMPT}]

    # Inject RAG + user context as a system-level preamble
    if rag_context or user_context:
        context_parts = []
        if user_context:
            context_parts.append(user_context)
        if rag_context:
            context_parts.append(
                f"--- Relevant Wellness Knowledge ---\n{rag_context}"
            )
        llm_messages.append({
            "role": "system",
            "content": "\n\n".join(context_parts),
        })

    # Add conversation history
    for msg in history:
        llm_messages.append({"role": msg.role, "content": msg.content})

    # Add current user message
    llm_messages.append({"role": "user", "content": message})

    # 5. Call Groq
    try:
        client = _get_client()
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            max_tokens=512,
            temperature=0.8,
            messages=llm_messages,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️ Buddy generation error: {e}")
        return (
            "I'm having a little trouble connecting right now 💛 "
            "But I'm still here for you. Could you try again in a moment?"
        )
