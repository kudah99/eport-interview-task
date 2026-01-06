from sqlalchemy import and_, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.base import BaseRepository, db_error_handler
from app.models.api_key import ApiKey


class ApiKeyRepository(BaseRepository):
    def __init__(self, conn: AsyncSession) -> None:
        super().__init__(conn)

    @db_error_handler
    async def get_api_key_by_hash(self, *, key_hash: str) -> ApiKey | None:
        """Get an API key by its hash."""
        query = select(ApiKey).where(
            and_(
                ApiKey.key_hash == key_hash,
                ApiKey.is_active.is_(True),
                ApiKey.deleted_at.is_(None),
            )
        ).limit(1)

        raw_result = await self.connection.execute(query)
        result = raw_result.fetchone()

        return result.ApiKey if result is not None else None

    @db_error_handler
    async def get_api_key_by_id(self, *, api_key_id: int) -> ApiKey | None:
        """Get an API key by its ID."""
        query = select(ApiKey).where(
            and_(ApiKey.id == api_key_id, ApiKey.deleted_at.is_(None))
        ).limit(1)

        raw_result = await self.connection.execute(query)
        result = raw_result.fetchone()

        return result.ApiKey if result is not None else None

    @db_error_handler
    async def get_all_api_keys(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False,
    ) -> list[ApiKey]:
        """Get all API keys with optional filtering."""
        query = select(ApiKey).where(ApiKey.deleted_at.is_(None))

        if not include_inactive:
            query = query.where(ApiKey.is_active.is_(True))

        query = query.order_by(ApiKey.created_at.desc()).offset(skip).limit(limit)

        raw_results = await self.connection.execute(query)
        results = raw_results.scalars().all()
        return results

    @db_error_handler
    async def create_api_key(
        self,
        *,
        key_hash: str,
        name: str,
        expires_at: str | None = None,
    ) -> ApiKey:
        """Create a new API key."""
        from datetime import datetime
        
        expires_datetime = None
        if expires_at:
            try:
                expires_datetime = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                expires_datetime = None
        
        api_key = ApiKey(
            key_hash=key_hash,
            name=name,
            is_active=True,
            expires_at=expires_datetime,
        )
        self.connection.add(api_key)
        await self.connection.commit()
        await self.connection.refresh(api_key)
        return api_key

    @db_error_handler
    async def deactivate_api_key(self, *, api_key: ApiKey) -> ApiKey:
        """Deactivate an API key."""
        api_key.is_active = False
        self.connection.add(api_key)
        await self.connection.commit()
        await self.connection.refresh(api_key)
        return api_key

    @db_error_handler
    async def activate_api_key(self, *, api_key: ApiKey) -> ApiKey:
        """Activate an API key."""
        api_key.is_active = True
        self.connection.add(api_key)
        await self.connection.commit()
        await self.connection.refresh(api_key)
        return api_key

    @db_error_handler
    async def update_last_used(self, *, api_key: ApiKey) -> ApiKey:
        """Update the last used timestamp for an API key."""
        from datetime import datetime, timezone
        api_key.last_used_at = datetime.now(timezone.utc)
        self.connection.add(api_key)
        await self.connection.commit()
        await self.connection.refresh(api_key)
        return api_key

    @db_error_handler
    async def delete_api_key(self, *, api_key: ApiKey) -> ApiKey:
        """Soft delete an API key."""
        from sqlalchemy import func

        api_key.deleted_at = func.now()
        api_key.is_active = False
        self.connection.add(api_key)
        await self.connection.commit()
        await self.connection.refresh(api_key)
        return api_key

