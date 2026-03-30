"""ElevenLabs TTS Service — Text-to-speech for VinR Buddy voice replies."""

import httpx
import base64
from app.core.config import get_settings

settings = get_settings()

ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# Default fallback voice (Sarah — known working premade voice)
DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

# Persona Voice IDs — all verified ElevenLabs premade voices
SARA_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"      # Sarah — Kind, Calm, Soothing
ALEX_VOICE_ID = "IKne3meq5aSn9XLyUdCD"       # Charlie — Nerd, Playful, Energetic
VINR_VOICE_ID = "TxGEqnHWrfWFTfGW9XjX"       # Josh — Smart, Efficient (Standard AI)
THERAPIST_VOICE_ID = "N2lVS1w4EtoT3dr4eOWO"   # Callum — Professional, Deep (Therapist)
COACH_VOICE_ID = "ODq5zmih8GrVes37Dizd"       # Patrick — Strong, Energetic (Coach)

PERSONA_VOICES = {
    "sara": SARA_VOICE_ID,
    "hope": SARA_VOICE_ID,       # Hope uses Sara's soothing voice
    "alex": ALEX_VOICE_ID,
    "vinr": VINR_VOICE_ID,
    "sage": THERAPIST_VOICE_ID,  # Sage uses the deep, calm Callum voice
    "therapist": THERAPIST_VOICE_ID,
    "coach": COACH_VOICE_ID,
}


async def _call_tts(client: httpx.AsyncClient, api_key: str, text: str, vid: str) -> httpx.Response:
    """Make a single TTS API call."""
    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {
            "stability": 0.6,
            "similarity_boost": 0.75,
            "style": 0.3,
        },
    }
    return await client.post(
        f"{ELEVENLABS_API_URL}/{vid}",
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
        },
        json=payload,
    )


async def text_to_speech(
    text: str,
    voice_id: str | None = None,
) -> bytes | None:
    """
    Convert text to speech using ElevenLabs API.
    Falls back to default voice if the requested voice is not found.

    Args:
        text: Text to convert to speech
        voice_id: Optional voice ID override

    Returns:
        Audio bytes (mp3) or None if API key is not configured
    """
    api_key = settings.ELEVENLABS_API_KEY
    if not api_key:
        return None

    vid = voice_id or settings.ELEVENLABS_VOICE_ID or DEFAULT_VOICE_ID

    print(f"🔊 Generating TTS: '{text[:50]}...' using voice '{vid}'")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await _call_tts(client, api_key, text, vid)

            # If voice not found, retry with default fallback
            if response.status_code == 404 and vid != DEFAULT_VOICE_ID:
                print(f"⚠️ Voice '{vid}' not found, falling back to default '{DEFAULT_VOICE_ID}'")
                response = await _call_tts(client, api_key, text, DEFAULT_VOICE_ID)

            if response.status_code == 200:
                audio_len = len(response.content)
                print(f"✅ ElevenLabs success: {audio_len} bytes generated.")
                return response.content
            else:
                error_detail = response.text[:200]
                print(f"❌ ElevenLabs API error ({response.status_code}): {error_detail}")
                return None
    except Exception as e:
        print(f"❌ ElevenLabs connection error: {str(e)}")
        return None


def audio_bytes_to_data_uri(audio_bytes: bytes) -> str:
    """Convert audio bytes to a base64 data URI for inline playback."""
    b64 = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:audio/mpeg;base64,{b64}"

