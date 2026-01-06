import os
from functools import lru_cache

from dotenv import load_dotenv

from app.core.settings.app import AppSettings
from app.core.settings.base import AppEnvTypes
from app.core.settings.dev import DevAppSettings
from app.core.settings.prod import ProdAppSettings
from app.core.settings.test import TestAppSettings

# Load .env file once at module level
load_dotenv()

environments: dict[AppEnvTypes, type[AppSettings]] = {
    AppEnvTypes.dev: DevAppSettings,
    AppEnvTypes.prod: ProdAppSettings,
    AppEnvTypes.test: TestAppSettings,
}


@lru_cache
def get_app_settings() -> AppSettings:
    """
    Get application settings based on APP_ENV environment variable.
    
    Reads APP_ENV directly from environment to avoid validation issues
    when BaseAppSettings tries to validate all .env fields.
    """
    # Get APP_ENV directly from environment
    app_env_str = os.getenv("APP_ENV", "dev").lower()
    try:
        app_env = AppEnvTypes[app_env_str]
    except KeyError:
        # Default to dev if invalid value
        app_env = AppEnvTypes.dev
    
    config = environments[app_env]
    return config()
