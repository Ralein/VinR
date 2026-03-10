"""Media Service — S3 audio files and YouTube integration."""

import httpx
from app.core.config import get_settings

settings = get_settings()

# --- Hardcoded Audio Catalog ---
# In production, these would be served from S3 with pre-signed URLs.
# For now, we use a hardcoded catalog that returns track metadata.

AUDIO_CATALOG = {
    "sleep": [
        {"id": "sleep-rain", "title": "Gentle Rain", "artist": "VinR Sounds", "duration_label": "30 min", "duration_seconds": 1800, "thumbnail_emoji": "🌧️"},
        {"id": "sleep-ocean", "title": "Ocean Waves", "artist": "VinR Sounds", "duration_label": "45 min", "duration_seconds": 2700, "thumbnail_emoji": "🌊"},
        {"id": "sleep-whitenoise", "title": "White Noise", "artist": "VinR Sounds", "duration_label": "60 min", "duration_seconds": 3600, "thumbnail_emoji": "☁️"},
        {"id": "sleep-forest", "title": "Forest Night", "artist": "VinR Sounds", "duration_label": "30 min", "duration_seconds": 1800, "thumbnail_emoji": "🌲"},
        {"id": "sleep-binaural", "title": "Binaural Beats (Delta)", "artist": "VinR Sounds", "duration_label": "45 min", "duration_seconds": 2700, "thumbnail_emoji": "🔮"},
    ],
    "breathing": [
        {"id": "breath-box", "title": "Box Breathing (4-4-4-4)", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "📦"},
        {"id": "breath-478", "title": "4-7-8 Breathing", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "🫁"},
        {"id": "breath-coherent", "title": "Coherent Breathing (5-5)", "artist": "VinR Guide", "duration_label": "10 min", "duration_seconds": 600, "thumbnail_emoji": "🌬️"},
    ],
    "meditation": [
        {"id": "med-5min", "title": "Quick Calm", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "🧘"},
        {"id": "med-10min", "title": "Mindful Reset", "artist": "VinR Guide", "duration_label": "10 min", "duration_seconds": 600, "thumbnail_emoji": "🧘‍♀️"},
        {"id": "med-15min", "title": "Deep Presence", "artist": "VinR Guide", "duration_label": "15 min", "duration_seconds": 900, "thumbnail_emoji": "🕉️"},
    ],
    "affirmation": [
        {"id": "affirm-morning", "title": "Morning Power", "artist": "VinR Guide", "duration_label": "3 min", "duration_seconds": 180, "thumbnail_emoji": "☀️"},
        {"id": "affirm-confidence", "title": "I Am Enough", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "💪"},
        {"id": "affirm-calm", "title": "Peace Within", "artist": "VinR Guide", "duration_label": "3 min", "duration_seconds": 180, "thumbnail_emoji": "🕊️"},
    ],
}

# Genre → YouTube search query mapping
YOUTUBE_QUERIES = {
    "music": {
        "Pop": "relaxing pop music playlist",
        "R&B": "chill r&b playlist relax",
        "Hip-Hop": "lo-fi hip hop beats relax",
        "Classical": "calming classical music",
        "Indie": "indie chill playlist",
        "Electronic": "ambient electronic music",
        "Country": "acoustic country relax",
        "K-Pop": "chill kpop playlist",
        "Jazz": "smooth jazz relax",
        "Rock": "soft rock acoustic playlist",
    },
    "motivation": {
        "Pop": "motivational speech success",
        "R&B": "motivational speech never give up",
        "Hip-Hop": "hip hop motivation speech",
        "Classical": "motivational classical music epic",
        "Indie": "inspirational speeches life",
        "Electronic": "motivational speech with music",
        "Country": "motivational speech hard work",
        "K-Pop": "motivational speech dream big",
        "Jazz": "motivational speech mindset",
        "Rock": "motivational speech rock your life",
    },
}


async def get_audio_library(category: str) -> list[dict]:
    """
    Get audio tracks by category.
    
    Categories: sleep, breathing, meditation, affirmation
    
    Returns list of track dicts. In production, each would include
    an S3 pre-signed URL. For now returns the hardcoded catalog.
    """
    tracks = AUDIO_CATALOG.get(category, [])
    
    # If AWS is configured, generate pre-signed URLs
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_S3_BUCKET:
        try:
            import boto3
            s3 = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
            for track in tracks:
                key = f"audio/{category}/{track['id']}.mp3"
                track["url"] = s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.AWS_S3_BUCKET, "Key": key},
                    ExpiresIn=3600,
                )
        except Exception as e:
            print(f"S3 URL generation failed: {e}")
            # Tracks will have url=None, frontend can handle gracefully
    
    return tracks


async def search_youtube(genre: str, content_type: str = "music") -> list[dict]:
    """
    Search YouTube for curated playlists based on user's genre preference.
    
    Args:
        genre: User's music genre (Pop, R&B, etc.)
        content_type: "music" or "motivation"
    
    Returns list of video dicts with video_id, title, channel, thumbnail_url
    """
    if not settings.YOUTUBE_API_KEY:
        # Return empty list if no API key configured
        return []

    type_queries = YOUTUBE_QUERIES.get(content_type, YOUTUBE_QUERIES["music"])
    query = type_queries.get(genre, f"{genre} {content_type} playlist")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "key": settings.YOUTUBE_API_KEY,
                    "q": query,
                    "part": "snippet",
                    "type": "video",
                    "maxResults": 6,
                    "videoCategoryId": "10" if content_type == "music" else "22",
                    "order": "relevance",
                    "safeSearch": "strict",
                },
                timeout=10.0,
            )
            data = response.json()

            results = []
            for item in data.get("items", []):
                snippet = item.get("snippet", {})
                results.append({
                    "video_id": item["id"]["videoId"],
                    "title": snippet.get("title", ""),
                    "channel": snippet.get("channelTitle", ""),
                    "thumbnail_url": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                })
            return results

    except Exception as e:
        print(f"YouTube search error: {e}")
        return []
