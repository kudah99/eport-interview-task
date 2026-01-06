"""
CLI commands for managing API keys.
"""
import asyncio
import sys
from datetime import datetime, timedelta
from typing import Optional

import click
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Note: UsersRepository expects AsyncSession, not AsyncConnection

from app.core.config import get_app_settings
from app.core import security
from app.database.repositories.api_key import ApiKeyRepository
from app.database.repositories.users import UsersRepository
from app.models.api_key import ApiKey
from app.schemas.user import UserInCreate

settings = get_app_settings()


def get_db_session_factory():
    """Create a database session factory for CLI commands."""
    engine = create_async_engine(
        url=str(settings.db_url),
        pool_size=5,
        max_overflow=0,
        echo=False,
        future=True,
    )
    async_session_factory = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=True,
    )
    return async_session_factory


async def _create_api_key(name: str, expires_days: Optional[int] = None) -> tuple[str, ApiKey]:
    """Internal function to create an API key."""
    session_factory = get_db_session_factory()
    async with session_factory() as db:
        repo = ApiKeyRepository(db)
        
        # Generate a new API key
        api_key = ApiKey.generate_key()
        key_hash = security.hash_api_key(api_key)
        
        # Calculate expiry date if provided
        expires_at = None
        if expires_days:
            from datetime import timezone
            expires_at = datetime.now(timezone.utc) + timedelta(days=expires_days)
        
        # Create the API key record
        api_key_record = await repo.create_api_key(
            key_hash=key_hash,
            name=name,
            expires_at=expires_at.isoformat() if expires_at else None,
        )
        
        return api_key, api_key_record


async def _deactivate_api_key(api_key_id: int) -> bool:
    """Internal function to deactivate an API key."""
    session_factory = get_db_session_factory()
    async with session_factory() as db:
        repo = ApiKeyRepository(db)
        
        api_key = await repo.get_api_key_by_id(api_key_id=api_key_id)
        if not api_key:
            return False
        
        await repo.deactivate_api_key(api_key=api_key)
        return True


async def _list_api_keys(include_inactive: bool = False) -> list[ApiKey]:
    """Internal function to list API keys."""
    session_factory = get_db_session_factory()
    async with session_factory() as db:
        repo = ApiKeyRepository(db)
        keys = await repo.get_all_api_keys(include_inactive=include_inactive)
        return keys


async def _create_user(username: str, email: str, password: str) -> dict:
    """Internal function to create a user."""
    session_factory = get_db_session_factory()
    async with session_factory() as db:
        repo = UsersRepository(db)
        
        # Check if user already exists
        existing_user = await repo.get_duplicated_user(user_in=UserInCreate(
            username=username,
            email=email,
            password=password
        ))
        
        if existing_user:
            return {"error": "User with this username or email already exists", "user": None}
        
        # Create new user
        user_in = UserInCreate(
            username=username,
            email=email,
            password=password
        )
        
        created_user = await repo.signup_user(user_in=user_in)
        
        return {"error": None, "user": created_user}


@click.group()
def cli():
    """Warranty Register Management CLI."""
    pass


@cli.command()
@click.option("--name", required=True, help="Name/description for the API key")
@click.option("--expires-days", type=int, help="Number of days until the key expires (optional)")
def generate(name: str, expires_days: Optional[int]):
    """Generate a new API key."""
    try:
        api_key, api_key_record = asyncio.run(_create_api_key(name, expires_days))
        
        click.echo("\n" + "=" * 60)
        click.echo("API Key Generated Successfully!")
        click.echo("=" * 60)
        click.echo(f"\nKey ID: {api_key_record.id}")
        click.echo(f"Name: {api_key_record.name}")
        click.echo(f"Created: {api_key_record.created_at}")
        if api_key_record.expires_at:
            click.echo(f"Expires: {api_key_record.expires_at}")
        click.echo("\n" + "-" * 60)
        click.echo("IMPORTANT: Save this API key now. It will not be shown again!")
        click.echo("-" * 60)
        click.echo(f"\nAPI Key: {api_key}\n")
        click.echo("=" * 60)
        click.echo("\nUsage:")
        click.echo(f'  curl -H "X-API-Key: {api_key}" http://localhost:8000/api/v1/warranty')
        click.echo("=" * 60 + "\n")
        
    except Exception as e:
        click.echo(f"Error generating API key: {str(e)}", err=True)
        sys.exit(1)


@cli.command()
@click.option("--id", "api_key_id", type=int, required=True, help="ID of the API key to deactivate")
def deactivate(api_key_id: int):
    """Deactivate an API key by ID."""
    try:
        success = asyncio.run(_deactivate_api_key(api_key_id))
        
        if success:
            click.echo(f"✓ API key {api_key_id} has been deactivated successfully.")
        else:
            click.echo(f"✗ API key {api_key_id} not found.", err=True)
            sys.exit(1)
            
    except Exception as e:
        click.echo(f"Error deactivating API key: {str(e)}", err=True)
        sys.exit(1)


@cli.command()
@click.option("--include-inactive", is_flag=True, help="Include inactive API keys in the list")
def list_keys(include_inactive: bool):
    """List all API keys."""
    try:
        keys = asyncio.run(_list_api_keys(include_inactive=include_inactive))
        
        if not keys:
            click.echo("No API keys found.")
            return
        
        click.echo("\n" + "=" * 80)
        click.echo("API Keys")
        click.echo("=" * 80)
        
        for key in keys:
            status = "✓ Active" if key.is_active else "✗ Inactive"
            click.echo(f"\nID: {key.id}")
            click.echo(f"Name: {key.name}")
            click.echo(f"Status: {status}")
            click.echo(f"Created: {key.created_at}")
            if key.last_used_at:
                click.echo(f"Last Used: {key.last_used_at}")
            if key.expires_at:
                click.echo(f"Expires: {key.expires_at}")
            click.echo("-" * 80)
        
        click.echo(f"\nTotal: {len(keys)} key(s)\n")
        
    except Exception as e:
        click.echo(f"Error listing API keys: {str(e)}", err=True)
        sys.exit(1)


@cli.command()
@click.option("--username", required=True, help="Username for the new user")
@click.option("--email", required=True, help="Email address for the new user")
@click.option("--password", required=True, prompt=True, hide_input=True, confirmation_prompt=True, help="Password for the new user")
def create_user(username: str, email: str, password: str):
    """Create a new user account for Warranty Centre login."""
    try:
        result = asyncio.run(_create_user(username, email, password))
        
        if result["error"]:
            click.echo(f"✗ Error: {result['error']}", err=True)
            sys.exit(1)
        
        user = result["user"]
        
        click.echo("\n" + "=" * 60)
        click.echo("User Account Created Successfully!")
        click.echo("=" * 60)
        click.echo(f"\nUser ID: {user.id}")
        click.echo(f"Username: {user.username}")
        click.echo(f"Email: {user.email}")
        click.echo(f"Created: {user.created_at}")
        click.echo("\n" + "-" * 60)
        click.echo("Login Credentials:")
        click.echo("-" * 60)
        click.echo(f"Email: {user.email}")
        click.echo(f"Password: [The password you entered]")
        click.echo("\n" + "=" * 60)
        click.echo("\nYou can now use these credentials to log in to the Warranty Centre.")
        click.echo("Visit: http://localhost:8000/")
        click.echo("=" * 60 + "\n")
        
    except Exception as e:
        click.echo(f"Error creating user: {str(e)}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    cli()

