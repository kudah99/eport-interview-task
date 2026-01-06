import secrets
from sqlalchemy import Column, Integer, String, Boolean, DateTime, text
from sqlalchemy.sql import func

from app.models.common import DateTimeModelMixin
from app.models.rwmodel import RWModel


class ApiKey(RWModel, DateTimeModelMixin):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key_hash = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    @staticmethod
    def generate_key() -> str:
        """Generate a secure random API key."""
        return f"wr_{secrets.token_urlsafe(32)}"

    def is_expired(self) -> bool:
        """Check if the API key has expired."""
        from datetime import datetime
        if self.expires_at is None:
            return False
        return self.expires_at < datetime.now(self.expires_at.tzinfo)

