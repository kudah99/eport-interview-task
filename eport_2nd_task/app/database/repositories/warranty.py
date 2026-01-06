from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncConnection

from app.database.repositories.base import BaseRepository, db_error_handler
from app.models.warranty import Warranty
from app.schemas.warranty import WarrantyInCreate, WarrantyInUpdate


class WarrantyRepository(BaseRepository):
    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)

    @db_error_handler
    async def get_warranty_by_id(self, *, warranty_id: int) -> Warranty | None:
        query = select(Warranty).where(and_(Warranty.id == warranty_id, Warranty.deleted_at.is_(None))).limit(1)

        raw_result = await self.connection.execute(query)
        result = raw_result.fetchone()

        return result.Warranty if result is not None else None

    @db_error_handler
    async def get_filtered_warranties(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        department: str | None = None,
        category: str | None = None,
    ) -> list[Warranty]:
        query = select(Warranty).where(Warranty.deleted_at.is_(None))

        if status:
            query = query.where(Warranty.status == status)
        if department:
            query = query.where(Warranty.department == department)
        if category:
            query = query.where(Warranty.category == category)

        query = query.offset(skip).limit(limit)

        raw_results = await self.connection.execute(query)
        results = raw_results.scalars().all()
        return results

    @db_error_handler
    async def create_warranty(self, *, warranty_in: WarrantyInCreate) -> Warranty:
        created_warranty = Warranty(**warranty_in.model_dump(exclude_none=True))
        self.connection.add(created_warranty)
        await self.connection.commit()
        await self.connection.refresh(created_warranty)
        return created_warranty

    @db_error_handler
    async def update_warranty(self, *, warranty: Warranty, warranty_in: WarrantyInUpdate) -> Warranty:
        warranty_in_obj = warranty_in.model_dump(exclude_unset=True)

        for key, val in warranty_in_obj.items():
            setattr(warranty, key, val)

        self.connection.add(warranty)
        await self.connection.commit()
        await self.connection.refresh(warranty)
        return warranty

    @db_error_handler
    async def delete_warranty(self, *, warranty: Warranty) -> Warranty:
        from sqlalchemy import func

        warranty.deleted_at = func.now()

        self.connection.add(warranty)
        await self.connection.commit()
        await self.connection.refresh(warranty)
        return warranty

