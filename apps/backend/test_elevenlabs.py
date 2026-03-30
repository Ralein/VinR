import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Bella / VinR default

async def test_tts():
    if not ELEVENLABS_API_KEY:
        print("❌ No ELEVENLABS_API_KEY found in .env")
        return

    print(f"Testing ElevenLabs with Voice: {VOICE_ID}")
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": "Hello, I am Winner. I am a helpful AI buddy using VinR LLM.",
        "model_id": "eleven_turbo_v2_5"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                print(f"✅ Success! Generated {len(response.content)} bytes of audio.")
            else:
                print(f"❌ Failed ({response.status_code}): {response.text}")
        except Exception as e:
            print(f"❌ Connection error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_tts())
