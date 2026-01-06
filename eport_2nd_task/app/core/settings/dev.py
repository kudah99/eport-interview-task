import logging
from urllib.parse import urlparse

from pydantic import SecretStr, field_validator

from app.core.settings.app import AppSettings


class DevAppSettings(AppSettings):
    # fastapi_kwargs
    debug: bool = True
    title: str = "Dev FastAPI example application"

    # back-end app settings
    secret_key: SecretStr = SecretStr("secret-dev")
    db_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/eport"
    logging_level: int = logging.DEBUG

    @field_validator("db_url", mode="before")
    @classmethod
    def validate_db_url(cls, v):
        """Validate database URL format, allowing postgresql+asyncpg:// scheme."""
        if isinstance(v, str):
            # Check if it's a postgresql URL (with or without +asyncpg)
            if not (
                v.startswith("postgresql://") or v.startswith("postgresql+asyncpg://")
            ):
                raise ValueError(
                    "Database URL must use postgresql:// or postgresql+asyncpg:// scheme"
                )
            # Replace +asyncpg for validation purposes to check URL structure
            url_for_validation = v.replace("postgresql+asyncpg://", "postgresql://")
            try:
                parsed = urlparse(url_for_validation)
                if not parsed.scheme:
                    raise ValueError("Invalid database URL: missing scheme")
                if not parsed.hostname and not parsed.path:
                    raise ValueError("Invalid database URL: missing hostname or path")
            except Exception as e:
                raise ValueError(f"Invalid database URL format: {e}")
        return v

    @field_validator("logging_level", mode="before")
    @classmethod
    def parse_logging_level(cls, v):
        """Convert string logging level names to integers."""
        if isinstance(v, str):
            level_map = {
                "DEBUG": logging.DEBUG,
                "INFO": logging.INFO,
                "WARNING": logging.WARNING,
                "ERROR": logging.ERROR,
                "CRITICAL": logging.CRITICAL,
            }
            return level_map.get(v.upper(), logging.DEBUG)
        return v
