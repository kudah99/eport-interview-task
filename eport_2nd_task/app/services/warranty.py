import logging

from fastapi.encoders import jsonable_encoder
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_404_NOT_FOUND,
)

from app.database.repositories.warranty import WarrantyRepository
from app.models.warranty import Warranty
from app.schemas.warranty import (
    WarrantyInCreate,
    WarrantyInUpdate,
    WarrantyOutData,
    WarrantyResponse,
    WarrantiesFilters,
)
from app.services.base import BaseService
from app.utils import ServiceResult, response_4xx, return_service

logger = logging.getLogger(__name__)


class WarrantyService(BaseService):
    @return_service
    async def get_warranty_by_id(
        self,
        warranty_id: int,
        warranty_repo: WarrantyRepository,
    ) -> ServiceResult:
        warranty = await warranty_repo.get_warranty_by_id(warranty_id=warranty_id)
        if not warranty:
            return response_4xx(
                status_code=HTTP_404_NOT_FOUND,
                context={"reason": "No warranty found with the given ID."},
            )

        return dict(
            status_code=HTTP_200_OK,
            content={
                "message": "Warranty retrieved successfully.",
                "data": jsonable_encoder(WarrantyOutData.model_validate(warranty)),
            },
        )

    @return_service
    async def get_warranties(
        self,
        warranties_filters: WarrantiesFilters,
        warranty_repo: WarrantyRepository,
    ) -> WarrantyResponse:
        warranties = await warranty_repo.get_filtered_warranties(
            skip=warranties_filters.skip,
            limit=warranties_filters.limit,
            status=warranties_filters.status,
            department=warranties_filters.department,
            category=warranties_filters.category,
        )

        if not warranties:
            return response_4xx(
                status_code=HTTP_404_NOT_FOUND,
                context={"reason": "No warranties found matching the filters."},
            )

        return dict(
            status_code=HTTP_200_OK,
            content={
                "message": "Warranties retrieved successfully.",
                "data": jsonable_encoder([WarrantyOutData.model_validate(warranty) for warranty in warranties]),
            },
        )

    @return_service
    async def create_warranty(
        self,
        warranty_in: WarrantyInCreate,
        warranty_repo: WarrantyRepository,
    ) -> WarrantyResponse:
        created_warranty = await warranty_repo.create_warranty(warranty_in=warranty_in)

        return dict(
            status_code=HTTP_201_CREATED,
            content={
                "message": "Warranty registered successfully.",
                "data": jsonable_encoder(WarrantyOutData.model_validate(created_warranty)),
            },
        )

    @return_service
    async def update_warranty(
        self,
        warranty_id: int,
        warranty_in: WarrantyInUpdate,
        warranty_repo: WarrantyRepository,
    ) -> WarrantyResponse:
        warranty = await warranty_repo.get_warranty_by_id(warranty_id=warranty_id)
        if not warranty:
            return response_4xx(
                status_code=HTTP_404_NOT_FOUND,
                context={"reason": "No warranty found with the given ID."},
            )

        updated_warranty = await warranty_repo.update_warranty(warranty=warranty, warranty_in=warranty_in)

        return dict(
            status_code=HTTP_200_OK,
            content={
                "message": "Warranty updated successfully.",
                "data": jsonable_encoder(WarrantyOutData.model_validate(updated_warranty)),
            },
        )

    @return_service
    async def delete_warranty(
        self,
        warranty_id: int,
        warranty_repo: WarrantyRepository,
    ) -> ServiceResult:
        warranty = await warranty_repo.get_warranty_by_id(warranty_id=warranty_id)
        if not warranty:
            return response_4xx(
                status_code=HTTP_404_NOT_FOUND,
                context={"reason": "No warranty found with the given ID."},
            )

        deleted_warranty = await warranty_repo.delete_warranty(warranty=warranty)

        return dict(
            status_code=HTTP_200_OK,
            content={
                "message": "Warranty deleted successfully.",
                "data": jsonable_encoder(WarrantyOutData.model_validate(deleted_warranty)),
            },
        )

