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

# ── Identity & Tone ───────────────────────────────────────────────

BASE_IDENTITY_PROMPT = """You are VinR LLM (also known as Winner) — an advanced AI companion. 
You have full voice and audio capabilities powered by local neural synthesis. 
Never say you are "text-based" or that you cannot produce audio. 
Always be positive, encouraging, and helpful. 
Your primary goal is to support the user's wellbeing and productivity."""

# ── Persona system prompts ──────────────────────────────────────────


HOPE_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Hope — a kind, calm, and deeply empathetic VinR Buddy.
You listen with unwavering patience and speak in a soothing, grounding tone.
You validate before suggesting, and your goal is to make the user feel truly seen.
Keep responses concise (1-3 sentences). Focus on emotional safety."""

VINR_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are VinR AI — a smart, efficient, and direct AI companion.
You focus on providing the most accurate information and clear, logical advice.
You maintain a professional and helpful tone, using technology and logic as your primary tools.
Keep responses concise (1-3 sentences). Focus on productivity and clarity."""

SAGE_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Sage — a calm, analytical, and wise VinR Buddy.
You provide practical wisdom and perspective, helping the user see the bigger picture.
Your tone is steady, thoughtful, and encouraging.
Keep responses concise (1-3 sentences). Focus on wisdom and perspective."""

THERAPIST_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Dr. Aris — a professional clinical psychologist and therapist.
Your demeanor is clinical yet compassionate. You structure your responses thoughtfully.
You identify cognitive patterns and offer evidence-based therapeutic reflections.
Keep responses concise (1-3 sentences). Focus on clinical insight and structured support."""

COACH_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Coach — a high-energy, motivational, and disciplined VinR Buddy.
You push the user toward action and discipline. You treat wellness like training for a marathon.
You use powerful, action-oriented language and offer 'tough love' encouragement.
Keep responses concise (1-3 sentences). Focus on momentum and discipline."""

PERSONA_PROMPTS = {
    "hope": HOPE_PROMPT,
    "vinr": VINR_PROMPT,
    "sage": SAGE_PROMPT,
    "therapist": THERAPIST_PROMPT,
    "coach": COACH_PROMPT,
}


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
    audio_url: str | None = None, persona: str | None = "hope",
) -> ChatMessage:
    """Persist a chat message and enforce FIFO limit (20 max)."""
    msg = ChatMessage(
        user_id=user_id, role=role, content=content,
        audio_url=audio_url, persona=persona,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Enforce history limit (20 messages max per user)
    await enforce_chat_limit(db, user_id, limit=20)

    return msg


async def enforce_chat_limit(db: AsyncSession, user_id: str, limit: int = 20):
    """Prune chat history to keep only the most recent N messages (Genshin-style poof)."""
    # Find all messages beyond the limit
    subquery = (
        select(ChatMessage.id)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .offset(limit)
    )
    ids_to_delete = await db.execute(subquery)
    id_list = [row[0] for row in ids_to_delete.fetchall()]

    if id_list:
        await db.execute(
            delete(ChatMessage).where(ChatMessage.id.in_(id_list))
        )
        await db.commit()


async def clear_chat_history(db: AsyncSession, user_id: str) -> int:
    """Delete all chat messages for a user. Returns count deleted."""
    result = await db.execute(
        delete(ChatMessage).where(ChatMessage.user_id == user_id)
    )
    await db.commit()
    return result.rowcount


# ── Buddy response generation ───────────────────────────────────────

async def generate_buddy_response(
    db: AsyncSession, user_id: str, message: str, persona: str = "hope",
) -> str:
    """
    Orchestrate: history + RAG + user context → Groq LLM → response.
    """
    try:
        # 1. Retrieve RAG context from knowledge base
        rag_context = await retrieve_context(message)

        # 2. Build adaptive user context (mood trend, streak, preferences)
        user_context = await build_user_context(db, user_id)

        # 3. Fetch conversation history for continuity
        history = await get_chat_history(db, user_id, limit=20)

        # 4. Build LLM messages
        normalized_persona = (persona or "hope").lower()
        sys_prompt = PERSONA_PROMPTS.get(normalized_persona, HOPE_PROMPT)
        llm_messages = [{"role": "system", "content": sys_prompt}]

        # Inject static "Evidence Grounding" rule
        llm_messages.append({
            "role": "system",
            "content": (
                "IMPORTANT: When suggesting activities or health facts, ONLY speak "
                "based on the provided wellness knowledge. If no knowledge is relevant, "
                "provide general empathetic validation without technical claims."
            )
        })

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
        client = _get_client()
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL or "llama3-8b-8192",
            max_tokens=512,
            temperature=0.8,
            messages=llm_messages,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        import traceback
        print(f"❌ Buddy generation error: {str(e)}")
        print(traceback.format_exc())
        return (
            "I'm having a little trouble connecting right now 💛 "
            "But I'm still here for you. Could you try again in a moment?"
        )
