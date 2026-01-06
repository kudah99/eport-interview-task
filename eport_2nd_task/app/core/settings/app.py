import logging
from typing import Any

from pydantic import ConfigDict, SecretStr, field_validator

from app.core.settings.base import BaseAppSettings


class AppSettings(BaseAppSettings):
    model_config = ConfigDict(
        validate_assignment=True,
        extra="ignore",  # Ignore extra fields from .env
    )

    # fastapi_kwargs
    debug: bool = False
    docs_url: str = "/docs"
    openapi_prefix: str = ""
    openapi_url: str = "/openapi.json"
    redoc_url: str = "/redoc"
    title: str = "Warranty Register"
    version: str = "0.3.0"

    # back-end app settings
    api_v1_prefix: str = "/api/v1"
    secret_key: SecretStr
    jwt_token_prefix: str = "bearer"
    auth_header_key: str = "Authorization"
    allowed_hosts: list[str] = ["*"]
    logging_level: int | None = None  # Optional, will be set by child classes

    @field_validator("logging_level", mode="before")
    @classmethod
    def parse_logging_level(cls, v):
        """Convert string logging level names to integers."""
        if v is None:
            return None
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

    @property
    def fastapi_kwargs(self) -> dict[str, Any]:
        return {
            "debug": self.debug,
            "docs_url": self.docs_url,
            "openapi_prefix": self.openapi_prefix,
            "openapi_url": self.openapi_url,
            "redoc_url": self.redoc_url,
            "title": self.title,
            "version": self.version,
        }
