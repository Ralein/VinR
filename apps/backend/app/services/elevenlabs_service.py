"""ElevenLabs TTS Service — Text-to-speech for VinR Buddy voice replies."""

import httpx
import base64
from app.core.config import get_settings

settings = get_settings()

ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# Persona Voice IDs
SARA_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Kind, Calm, Soothing
ALEX_VOICE_ID = "cgSgspJ2msm6clMCkdW9"  # Nerd, Playful, Energetic

PERSONA_VOICES = {
    "sara": SARA_VOICE_ID,
    "alex": ALEX_VOICE_ID,
}


async def text_to_speech(
    text: str,
    voice_id: str | None = None,
) -> bytes | None:
    """
    Convert text to speech using ElevenLabs API.

    Args:
        text: Text to convert to speech
        voice_id: Optional voice ID override

    Returns:
        Audio bytes (mp3) or None if API key is not configured
    """
    api_key = settings.ELEVENLABS_API_KEY
    if not api_key:
        return None

    vid = voice_id or settings.ELEVENLABS_VOICE_ID

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ELEVENLABS_API_URL}/{vid}",
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": "eleven_turbo_v2_5",
                    "voice_settings": {
                        "stability": 0.6,
                        "similarity_boost": 0.75,
                        "style": 0.3,
                    },
                },
            )

            if response.status_code == 200:
                return response.content
            else:
                print(
                    f"⚠️ ElevenLabs API error: {response.status_code} "
                    f"{response.text[:200]}"
                )
                return None
    except Exception as e:
        print(f"⚠️ ElevenLabs TTS error: {e}")
        return None


def audio_bytes_to_data_uri(audio_bytes: bytes) -> str:
    """Convert audio bytes to a base64 data URI for inline playback."""
    b64 = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:audio/mpeg;base64,{b64}"
