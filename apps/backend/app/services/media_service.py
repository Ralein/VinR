"""Media Service — S3 audio files and YouTube integration."""


async def get_audio_library(category: str) -> list[dict]:
    """
    Get audio tracks from S3 by category.

    Categories: sleep, breathing, meditation, affirmation

    This is a stub — real implementation in Sprint 2.3.
    """
    # TODO: Implement S3 listing with pre-signed URLs
    return []


async def search_youtube(genre: str, content_type: str = "music") -> list[dict]:
    """
    Search YouTube for curated playlists based on user's genre.

    This is a stub — real implementation in Sprint 2.3.
    """
    # TODO: Implement YouTube Data API v3 search proxy
    return []
