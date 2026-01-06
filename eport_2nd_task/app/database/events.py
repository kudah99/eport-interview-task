import logging

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.settings.app import AppSettings

logger = logging.getLogger(__name__)


async def connect_to_db(app: FastAPI, settings: AppSettings) -> None:
    logger.info("Connecting to database...")

    # Optimized connection pool settings
    # pool_size: Number of connections to maintain (20 is optimal for most apps)
    # max_overflow: Additional connections allowed during spikes (10 = 30 max total)
    # pool_pre_ping: Verify connections before using (prevents stale connections)
    # pool_recycle: Recycle connections after 1 hour (prevents database timeout issues)
    # echo: Enable SQL logging only in debug mode (performance impact in production)
    engine = create_async_engine(
        url=str(settings.db_url),
        pool_size=20,  # Reduced from 50 for better resource usage
        max_overflow=10,  # Allow temporary overflow during traffic spikes
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=settings.debug,  # Only log SQL in debug mode
        future=True,
    )
    async_session_factory = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=True,
    )
    app.state.pool = async_session_factory

    logger.info("Connected to database.")


async def close_db_connection(app: FastAPI) -> None:
    logger.info("Closing database connection...")

    # app.state.pool.close_all()

    logger.info("Database connection closed.")
