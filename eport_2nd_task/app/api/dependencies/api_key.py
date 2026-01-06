from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.api.dependencies.database import get_repository
from app.core import security
from app.database.repositories.api_key import ApiKeyRepository
from app.models.api_key import ApiKey

API_KEY_HEADER_NAME = "X-API-Key"


class APIKeyHeaderAuth(APIKeyHeader):
    def __init__(self):
        super().__init__(name=API_KEY_HEADER_NAME, auto_error=False)


async def verify_api_key(
    api_key_header: str | None = Security(APIKeyHeaderAuth()),
    api_key_repo: ApiKeyRepository = Depends(get_repository(ApiKeyRepository)),
) -> ApiKey:
    """
    Verify API key from request header.
    
    Args:
        api_key_header: The API key from the X-API-Key header
        api_key_repo: Repository for API key operations
        
    Returns:
        ApiKey: The validated API key object
        
    Raises:
        HTTPException: If API key is missing, invalid, inactive, or expired
    """
    if not api_key_header:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API key is required. Please provide X-API-Key header.",
        )

    # Hash the provided API key and find matching key in database
    # We use SHA-256 for API keys (not bcrypt) to avoid 72-byte limit
    provided_key_hash = security.hash_api_key(api_key_header)
    
    # Get API key by hash (direct lookup is more efficient)
    api_key = await api_key_repo.get_api_key_by_hash(key_hash=provided_key_hash)

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )

    # Check if key is active
    if not api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API key has been deactivated.",
        )

    # Check if key is expired
    if api_key.expires_at:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        if api_key.expires_at.tzinfo:
            now = now.replace(tzinfo=timezone.utc)
        if api_key.expires_at < now:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="API key has expired.",
            )

    # Update last used timestamp
    await api_key_repo.update_last_used(api_key=api_key)

    return api_key

