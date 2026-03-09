"""Clerk JWT authentication middleware.

Validates JWTs issued by Clerk using JWKS (RS256).
Clerk tokens use RS256 with rotating keys fetched from the JWKS endpoint.
"""

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import PyJWKClient
from app.core.config import get_settings

settings = get_settings()
security = HTTPBearer()

# Cache the JWKS client (handles key rotation automatically)
_jwks_client: PyJWKClient | None = None


def get_jwks_client() -> PyJWKClient:
    """Get or create a cached JWKS client for Clerk key verification."""
    global _jwks_client
    if _jwks_client is None and settings.CLERK_JWKS_URL:
        _jwks_client = PyJWKClient(settings.CLERK_JWKS_URL)
    return _jwks_client


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validate Clerk JWT token and return decoded payload.

    Clerk JWTs use RS256 with JWKS for key rotation.

    Returns the user payload containing:
    - sub: Clerk user ID (e.g., user_2abc123)
    - email: user email (in session claims)
    - azp: authorized party (your frontend URL)
    """
    token = credentials.credentials

    try:
        jwks_client = get_jwks_client()

        if jwks_client is None:
            # Fallback: if JWKS not configured, try basic decode (dev mode)
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                algorithms=["RS256"],
            )
        else:
            # Production: verify with Clerk's JWKS
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=settings.CLERK_ISSUER or None,
                options={
                    "verify_iss": bool(settings.CLERK_ISSUER),
                    "verify_aud": False,  # Clerk doesn't always set aud
                },
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token — missing sub claim",
            )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )
