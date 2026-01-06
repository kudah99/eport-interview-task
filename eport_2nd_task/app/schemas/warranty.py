from datetime import date, datetime
from typing import Any
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.message import ApiResponse


class WarrantyBase(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int | None = None
    asset_name: str
    category: str
    date_purchased: date
    cost: Decimal
    department: str
    status: str = "Active"
    user_id: int
    user_name: str
    warranty_period_months: int | None = None
    warranty_expiry_date: date | None = None
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None


class WarrantyInCreate(BaseModel):
    asset_name: str
    category: str
    date_purchased: date
    cost: Decimal
    department: str
    status: str = "Active"
    user_id: int
    user_name: str
    warranty_period_months: int | None = None
    warranty_expiry_date: date | None = None
    notes: str | None = None


class WarrantyInUpdate(BaseModel):
    asset_name: str | None = None
    category: str | None = None
    date_purchased: date | None = None
    cost: Decimal | None = None
    department: str | None = None
    status: str | None = None
    user_id: int | None = None
    user_name: str | None = None
    warranty_period_months: int | None = None
    warranty_expiry_date: date | None = None
    notes: str | None = None


class WarrantyOutData(WarrantyBase):
    pass


class WarrantiesFilters(BaseModel):
    skip: int | None = 0
    limit: int | None = 100
    status: str | None = None
    department: str | None = None
    category: str | None = None


class WarrantyResponse(ApiResponse):
    message: str = "Warranty API Response"
    data: WarrantyOutData | list[WarrantyOutData]
    detail: dict[str, Any] | None = {"key": "val"}

