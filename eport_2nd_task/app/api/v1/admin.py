from fastapi import APIRouter, Depends, Form, HTTPException, Query
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_401_UNAUTHORIZED

from app.api.dependencies.database import get_repository
from app.core import security
from app.database.repositories.api_key import ApiKeyRepository
from app.models.api_key import ApiKey
from app.schemas.api_key import (
    ApiKeyCreate,
    ApiKeyCreateResponse,
    ApiKeyOut,
    ApiKeysListResponse,
)
from app.utils import ERROR_RESPONSES

router = APIRouter()

# Hardcoded admin credentials
ADMIN_EMAIL = "admin@warranty-centre.co.zw"
ADMIN_PASSWORD = "admin.123"


def verify_admin_credentials(email: str, password: str) -> bool:
    """Verify admin credentials (hardcoded)."""
    return email == ADMIN_EMAIL and password == ADMIN_PASSWORD


@router.post(
    "/login",
    status_code=HTTP_200_OK,
    name="admin:login",
)
async def admin_login(
    email: str = Form(...),
    password: str = Form(...),
):
    """
    Admin login endpoint with hardcoded credentials.
    
    Valid credentials:
    - Email: admin@warranty-centre.co.zw
    - Password: admin.123
    """
    if verify_admin_credentials(email, password):
        return {"success": True, "message": "Login successful"}
    else:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )


@router.get(
    "/api-keys",
    status_code=HTTP_200_OK,
    response_model=ApiKeysListResponse,
    responses=ERROR_RESPONSES,
    name="admin:list-api-keys",
)
async def list_api_keys(
    *,
    api_key_repo: ApiKeyRepository = Depends(get_repository(ApiKeyRepository)),
    include_inactive: bool = Query(False, description="Include inactive API keys"),
) -> ApiKeysListResponse:
    """
    List all API keys (admin only).
    """
    keys = await api_key_repo.get_all_api_keys(include_inactive=include_inactive)
    
    return ApiKeysListResponse(
        message="API keys retrieved successfully",
        data=[ApiKeyOut.model_validate(key) for key in keys],
        total=len(keys),
    )


@router.post(
    "/api-keys",
    status_code=HTTP_201_CREATED,
    response_model=ApiKeyCreateResponse,
    responses=ERROR_RESPONSES,
    name="admin:create-api-key",
)
async def create_api_key(
    *,
    api_key_in: ApiKeyCreate,
    api_key_repo: ApiKeyRepository = Depends(get_repository(ApiKeyRepository)),
) -> ApiKeyCreateResponse:
    """
    Create a new API key (admin only).
    
    Returns the API key value (shown only once).
    """
    from datetime import datetime, timezone, timedelta
    
    # Generate API key
    api_key = ApiKey.generate_key()
    key_hash = security.hash_api_key(api_key)
    
    # Calculate expiry date if provided
    expires_at = None
    if api_key_in.expires_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=api_key_in.expires_days)
    
    # Create the API key record
    api_key_record = await api_key_repo.create_api_key(
        key_hash=key_hash,
        name=api_key_in.name,
        expires_at=expires_at.isoformat() if expires_at else None,
    )
    
    return ApiKeyCreateResponse(
        id=api_key_record.id,
        name=api_key_record.name,
        api_key=api_key,  # Return the plain key (only shown once)
        created_at=api_key_record.created_at,
        expires_at=api_key_record.expires_at,
    )


@router.post(
    "/api-keys/{api_key_id}/deactivate",
    status_code=HTTP_200_OK,
    response_model=ApiKeyOut,
    responses=ERROR_RESPONSES,
    name="admin:deactivate-api-key",
)
async def deactivate_api_key(
    *,
    api_key_id: int,
    api_key_repo: ApiKeyRepository = Depends(get_repository(ApiKeyRepository)),
) -> ApiKeyOut:
    """
    Deactivate an API key by ID (admin only).
    """
    api_key = await api_key_repo.get_api_key_by_id(api_key_id=api_key_id)
    
    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="API key not found",
        )
    
    deactivated_key = await api_key_repo.deactivate_api_key(api_key=api_key)
    
    return ApiKeyOut.model_validate(deactivated_key)


@router.post(
    "/api-keys/{api_key_id}/activate",
    status_code=HTTP_200_OK,
    response_model=ApiKeyOut,
    responses=ERROR_RESPONSES,
    name="admin:activate-api-key",
)
async def activate_api_key(
    *,
    api_key_id: int,
    api_key_repo: ApiKeyRepository = Depends(get_repository(ApiKeyRepository)),
) -> ApiKeyOut:
    """
    Activate an API key by ID (admin only).
    """
    api_key = await api_key_repo.get_api_key_by_id(api_key_id=api_key_id)
    
    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="API key not found",
        )
    
    activated_key = await api_key_repo.activate_api_key(api_key=api_key)
    
    return ApiKeyOut.model_validate(activated_key)

