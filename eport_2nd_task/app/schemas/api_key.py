from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ApiKeyBase(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    name: str
    is_active: bool
    last_used_at: datetime | None = None
    expires_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None


class ApiKeyOut(ApiKeyBase):
    pass


class ApiKeyCreate(BaseModel):
    name: str
    expires_days: int | None = None


class ApiKeyCreateResponse(BaseModel):
    id: int
    name: str
    api_key: str  # Only shown once when created
    created_at: datetime
    expires_at: datetime | None = None


class ApiKeysListResponse(BaseModel):
    message: str = "API Keys retrieved successfully"
    data: list[ApiKeyOut]
    total: int


class ApiKeyResponse(BaseModel):
    message: str
    data: ApiKeyOut | ApiKeyCreateResponse | list[ApiKeyOut]
    detail: dict[str, Any] | None = None

