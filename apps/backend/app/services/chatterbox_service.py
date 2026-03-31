"""Chatterbox TTS Service — Local text-to-speech using chatterbox-tts."""

import io
import base64
import torch
import torchaudio as ta
from chatterbox.tts import ChatterboxTTS
from app.core.config import get_settings

settings = get_settings()

# ── Voice Mapping ───────────────────────────────────────────────────
# chatterbox-tts supports zero-shot cloning. 
# For now, we use the default pretrained model.
# In the future, we can provide reference wav paths here.
PERSONA_VOICES = {
    "hope": None,
    "vinr": None,
    "sage": None,
    "therapist": None,
    "coach": None,
}

class ChatterboxService:
    """Singleton TTS service for local synthesis."""
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChatterboxService, cls).__new__(cls)
        return cls._instance

    @property
    def model(self):
        """Lazy load the model on first use."""
        if self._model is None:
            device = settings.CHATTERBOX_DEVICE or "cpu"
            print(f"📦 Loading chatterbox-tts model on {device}...")
            # Note: This might take a few seconds on first call
            self._model = ChatterboxTTS.from_pretrained(device=device)
            print("✅ Model loaded.")
        return self._model

    async def text_to_speech(self, text: str, persona: str = "vinr") -> bytes | None:
        """Generate WAV bytes from text."""
        try:
            # chatterbox-tts generate is synchronous, so we run it in a thread if high load
            # but for now, we just call it.
            # exaggeration and cfg_weight are tuned for naturalness
            wav = self.model.generate(
                text,
                exaggeration=0.5,
                cfg_weight=0.5
            )
            
            buffer = io.BytesIO()
            ta.save(buffer, wav, self.model.sr, format="wav")
            return buffer.getvalue()
        except Exception as e:
            print(f"❌ Chatterbox TTS error: {str(e)}")
            return None

def audio_bytes_to_data_uri(audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
    """Convert raw audio bytes to a Data URI for frontend playback."""
    base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{base64_audio}"

# Exportable singleton
tts_service = ChatterboxService()
async def text_to_speech(text: str, persona: str = "vinr") -> bytes | None:
    return await tts_service.text_to_speech(text, persona)
