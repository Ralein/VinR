"""Test chatterbox-tts independently."""

import asyncio
import os
import torch
from app.services.chatterbox_service import text_to_speech, audio_bytes_to_data_uri

async def test_tts():
    print("🧪 Testing chatterbox-tts...")
    text = "Hello, I am VinR. I am now speaking to you from your own computer."
    
    # This will trigger model download/loading on first run
    audio_bytes = await text_to_speech(text, persona="vinr")
    
    if audio_bytes:
        print(f"✅ Success! Generated {len(audio_bytes)} bytes of audio.")
        # Save to file for manual verification if possible
        with open("test_output.wav", "wb") as f:
            f.write(audio_bytes)
        print("📁 Saved output to test_output.wav")
        
        data_uri = audio_bytes_to_data_uri(audio_bytes)
        print(f"🔗 Data URI generated (length: {len(data_uri)})")
    else:
        print("❌ Failed to generate audio.")

if __name__ == "__main__":
    # Ensure we are in the backend app context for settings
    # We might need to set PYTHONPATH=apps/backend
    asyncio.run(test_tts())
