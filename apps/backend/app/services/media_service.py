"""Media Service — S3 audio files and YouTube integration."""

import random
import httpx
from app.core.config import get_settings

settings = get_settings()

# --- Hardcoded Audio Catalog ---
# In production, these would be served from S3 with pre-signed URLs.
# For now, we use a hardcoded catalog that returns track metadata.

AUDIO_CATALOG = {
    "sleep": [
        {"id": "sleep-rain", "title": "Gentle Rain", "artist": "VinR Sounds", "duration_label": "30 min", "duration_seconds": 1800, "thumbnail_emoji": "rain", "url": None},
        {"id": "sleep-ocean", "title": "Ocean Waves", "artist": "VinR Sounds", "duration_label": "45 min", "duration_seconds": 2700, "thumbnail_emoji": "ocean", "url": None},
        {"id": "sleep-whitenoise", "title": "White Noise", "artist": "VinR Sounds", "duration_label": "60 min", "duration_seconds": 3600, "thumbnail_emoji": "cloud", "url": None},
        {"id": "sleep-forest", "title": "Forest Night", "artist": "VinR Sounds", "duration_label": "30 min", "duration_seconds": 1800, "thumbnail_emoji": "forest", "url": None},
        {"id": "sleep-binaural", "title": "Binaural Beats (Delta)", "artist": "VinR Sounds", "duration_label": "45 min", "duration_seconds": 2700, "thumbnail_emoji": "binaural", "url": None},
    ],
    "breathing": [
        {"id": "breath-box", "title": "Box Breathing (4-4-4-4)", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "box", "url": None},
        {"id": "breath-478", "title": "4-7-8 Breathing", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "breath", "url": None},
        {"id": "breath-coherent", "title": "Coherent Breathing (5-5)", "artist": "VinR Guide", "duration_label": "10 min", "duration_seconds": 600, "thumbnail_emoji": "coherent", "url": None},
    ],
    "meditation": [
        {"id": "med-5min", "title": "Quick Calm", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "calm", "url": None},
        {"id": "med-10min", "title": "Mindful Reset", "artist": "VinR Guide", "duration_label": "10 min", "duration_seconds": 600, "thumbnail_emoji": "mindful", "url": None},
        {"id": "med-15min", "title": "Deep Presence", "artist": "VinR Guide", "duration_label": "15 min", "duration_seconds": 900, "thumbnail_emoji": "deep", "url": None},
    ],
    "affirmation": [
        {"id": "affirm-morning", "title": "Morning Power", "artist": "VinR Guide", "duration_label": "3 min", "duration_seconds": 180, "thumbnail_emoji": "morning", "url": None},
        {"id": "affirm-confidence", "title": "I Am Enough", "artist": "VinR Guide", "duration_label": "5 min", "duration_seconds": 300, "thumbnail_emoji": "confidence", "url": None},
        {"id": "affirm-calm", "title": "Peace Within", "artist": "VinR Guide", "duration_label": "3 min", "duration_seconds": 180, "thumbnail_emoji": "peace", "url": None},
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
    a pre-signed URL from a storage provider. For now returns the hardcoded catalog.
    """
    tracks = AUDIO_CATALOG.get(category, [])
    
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

async def search_youtube_reels(primary_reason: str, max_results: int = 10) -> list[dict]:
    """
    Search YouTube for short-form content (reels/shorts) related to user's primary wellness reason.
    
    Args:
        primary_reason: User's primary reason (e.g., "Stress Relief", "Better Sleep")
        max_results: Max number of videos to return.
    
    Returns list of video dicts with video_id, title, channel, thumbnail_url
    """
    if not settings.YOUTUBE_API_KEY:
        # Return empty list if no API key configured
        return []

    # Map the broad reason to something specific for shorts
    # e.g. "Stress Relief" -> "stress relief breathing exercise shorts"
    query = f"{primary_reason} tips shorts"
    
    if "sleep" in primary_reason.lower():
        query = "fall asleep fast tips shorts"
    elif "stress" in primary_reason.lower() or "anxiety" in primary_reason.lower():
        query = "anxiety relief breathing shorts"
    elif "focus" in primary_reason.lower():
        query = "productivity focus tips shorts"
    elif "energy" in primary_reason.lower():
        query = "morning energy boost tips shorts"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "key": settings.YOUTUBE_API_KEY,
                    "q": query,
                    "part": "snippet",
                    "type": "video",
                    "videoDuration": "short", # IMPORTANT: This ensures we get shorts < 4 mins
                    "maxResults": max_results,
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
                    "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                })
            random.shuffle(results)
            return results

    except Exception as e:
        print(f"YouTube Reels search error: {e}")
        return []
