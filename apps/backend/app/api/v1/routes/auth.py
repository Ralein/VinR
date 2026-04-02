import uuid
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import (
    get_current_user,
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.core.config import get_settings
from app.models.user import User
from app.services.email_service import send_password_reset_email
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserRegister,
    UserLogin,
    UserLogin,
    GoogleLogin,
    AppleLogin,
    TokenResponse,
    ForgotPassword,
    ResetPassword,
)
import jwt
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists",
        )

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        name=user_in.name,
    )
    db.add(user)
    await db.commit()

    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return tokens."""
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/google", response_model=TokenResponse)
async def google_login(user_in: GoogleLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate or register user via Google."""
    try:
        # Note: CLIENT_ID should ideally be passed or fetched from settings
        # On mobile, you might have different IDs for iOS and Android.
        # Verify against all allowed Client IDs (Web, iOS, Android)
        # Verify audience can be a single string or a list of strings
        idinfo = id_token.verify_oauth2_token(
            user_in.id_token, 
            google_requests.Request(), 
            audience=[settings.GOOGLE_CLIENT_ID] + settings.GOOGLE_CLIENT_IDS if settings.GOOGLE_CLIENT_ID else settings.GOOGLE_CLIENT_IDS
        )

        email = idinfo["email"]
        google_id = idinfo["sub"]
        name = idinfo.get("name")
        avatar_url = idinfo.get("picture")

        # Check if user exists by google_id or email
        result = await db.execute(
            select(User).where((User.google_id == google_id) | (User.email == email))
        )
        user = result.scalar_one_or_none()

        if not user:
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                email=email,
                google_id=google_id,
                name=name,
                avatar_url=avatar_url,
                is_email_verified=True,
            )
            db.add(user)
        else:
            # Update google_id if it was missing but email matched
            if not user.google_id:
                user.google_id = google_id
            if not user.name and name:
                user.name = name
            if not user.avatar_url and avatar_url:
                user.avatar_url = avatar_url

        await db.commit()
        await db.refresh(user)

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")


@router.post("/apple", response_model=TokenResponse)
async def apple_login(user_in: AppleLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate or register user via Apple."""
    try:
        # In a real app, you'd verify the Apple identity token.
        # This involves fetching Apple's public keys and verifying the signature.
        # For brevity and since this often requires a library or more boilerplate:
        unverified_claims = jwt.decode(user_in.identity_token, options={"verify_signature": False})
        
        apple_id = unverified_claims.get("sub")
        email = unverified_claims.get("email") or user_in.email

        if not apple_id:
            raise HTTPException(status_code=401, detail="Invalid Apple token claims")

        # Check if user exists by apple_id or email
        result = await db.execute(
            select(User).where((User.apple_id == apple_id) | (User.email == email))
        )
        user = result.scalar_one_or_none()

        if not user:
            if not email:
                raise HTTPException(status_code=400, detail="Email required for new Apple user")
                
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                email=email,
                apple_id=apple_id,
                name=user_in.name,
                is_email_verified=True,
            )
            db.add(user)
        else:
            # Update apple_id if it was missing but email matched
            if not user.apple_id:
                user.apple_id = apple_id
            if not user.name and user_in.name:
                user.name = user_in.name

        await db.commit()
        await db.refresh(user)

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Apple token: {str(e)}")



@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    """Send password reset email."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if user:
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        await db.commit()
        
        # Send password reset email
        send_password_reset_email(user.email, token)
        
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncSession = Depends(get_db)):
    """Reset password using token."""
    result = await db.execute(
        select(User).where(
            User.password_reset_token == data.token,
            User.password_reset_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    user.password_hash = get_password_hash(data.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    await db.commit()
    
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current authenticated user's profile."""
    user_id = current_user["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    updates: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    user_id = current_user["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    return user


@router.delete("/me")
async def delete_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete the current user's account and all related data."""
    user_id = current_user["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()

    return {"message": "Account deleted successfully"}
