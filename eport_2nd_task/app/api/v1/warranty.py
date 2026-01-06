from fastapi import APIRouter, Depends, Query
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from app.api.dependencies.database import get_repository
from app.api.dependencies.service import get_service
from app.database.repositories.warranty import WarrantyRepository
from app.schemas.warranty import (
    WarrantyInCreate,
    WarrantyResponse,
    WarrantiesFilters,
)
from app.services.warranty import WarrantyService
from app.utils import ERROR_RESPONSES, handle_result

router = APIRouter()


@router.post(
    "",
    status_code=HTTP_201_CREATED,
    response_model=WarrantyResponse,
    responses=ERROR_RESPONSES,
    name="warranty:register",
    summary="Register Device for Warranty",
    description="""
    Register a new device for warranty tracking.
    
    This endpoint allows you to register a device with warranty information including:
    - Asset details (name, category, purchase date, cost)
    - Department and status information
    - User information (user_id and user_name from the posting application)
    - Optional warranty details (warranty period, expiry date, notes)
    
    **Required Fields:**
    - `asset_name`: Name of the asset/device
    - `category`: Category of the device
    - `date_purchased`: Purchase date (YYYY-MM-DD format)
    - `cost`: Purchase cost
    - `department`: Department owning the device
    - `status`: Current status (default: "Active")
    - `user_id`: ID of the user registering the warranty (from posting application)
    - `user_name`: Name of the user registering the warranty (from posting application)
    
    **Optional Fields:**
    - `warranty_period_months`: Warranty period in months
    - `warranty_expiry_date`: Warranty expiry date (YYYY-MM-DD format)
    - `notes`: Additional notes about the warranty
    
    **Response:**
    Returns the created warranty record with all details including the assigned ID and timestamps.
    """,
    tags=["Warranty Registration"],
)
async def register_warranty(
    *,
    warranty_service: WarrantyService = Depends(get_service(WarrantyService)),
    warranty_repo: WarrantyRepository = Depends(get_repository(WarrantyRepository)),
    warranty_in: WarrantyInCreate,
) -> WarrantyResponse:
    """
    Register a new device for warranty.
    
    This endpoint creates a new warranty registration record in the database.
    All required fields must be provided, and the device will be assigned a unique ID.
    """
    result = await warranty_service.create_warranty(
        warranty_repo=warranty_repo,
        warranty_in=warranty_in,
    )

    return await handle_result(result)


@router.get(
    "",
    status_code=HTTP_200_OK,
    response_model=WarrantyResponse,
    responses=ERROR_RESPONSES,
    name="warranty:list",
)
async def list_warranties(
    *,
    warranty_service: WarrantyService = Depends(get_service(WarrantyService)),
    warranty_repo: WarrantyRepository = Depends(get_repository(WarrantyRepository)),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: str | None = Query(None),
    department: str | None = Query(None),
    category: str | None = Query(None),
) -> WarrantyResponse:
    """
    Get a list of warranties with optional filters.
    This endpoint is public and does not require API key authentication.
    """
    filters = WarrantiesFilters(
        skip=skip,
        limit=limit,
        status=status,
        department=department,
        category=category,
    )
    result = await warranty_service.get_warranties(
        warranties_filters=filters, warranty_repo=warranty_repo
    )

    return await handle_result(result)

