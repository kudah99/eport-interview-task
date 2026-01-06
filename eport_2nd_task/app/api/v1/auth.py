from fastapi import APIRouter, Depends
from starlette.status import HTTP_200_OK

from app.api.dependencies.auth import get_current_user_auth
from app.api.dependencies.database import get_repository
from app.api.dependencies.service import get_service
from app.core.config import get_app_settings
from app.core.settings.app import AppSettings
from app.database.repositories.users import UsersRepository
from app.models.user import User
from app.schemas.user import UserInSignIn, UserResponse, UserOutData
from app.services.users import UsersService
from app.utils import ERROR_RESPONSES, handle_result

router = APIRouter()


@router.post(
    "/login",
    status_code=HTTP_200_OK,
    response_model=UserResponse,
    responses=ERROR_RESPONSES,
    name="auth:login",
)
async def login(
    *,
    user_in: UserInSignIn,
    warranty_service: UsersService = Depends(get_service(UsersService)),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
    settings: AppSettings = Depends(get_app_settings),
) -> UserResponse:
    """
    Login endpoint for Warranty Centre.
    
    Authenticates a user with email and password, returns JWT token.
    """
    secret_key = str(settings.secret_key.get_secret_value())
    result = await warranty_service.signin_user(
        user_in=user_in,
        users_repo=users_repo,
        secret_key=secret_key,
    )

    return await handle_result(result)


@router.get(
    "/me",
    status_code=HTTP_200_OK,
    response_model=UserResponse,
    responses=ERROR_RESPONSES,
    name="auth:me",
)
async def get_current_user_info(
    *,
    current_user: User | None = Depends(get_current_user_auth(required=False)),
) -> UserResponse:
    """
    Get current authenticated user information.
    
    Returns user data if authenticated, or error if not.
    """
    if not current_user:
        from fastapi import HTTPException
        from starlette.status import HTTP_401_UNAUTHORIZED
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    from fastapi.encoders import jsonable_encoder
    return UserResponse(
        message="User information retrieved successfully",
        data=jsonable_encoder(UserOutData.model_validate(current_user)),
    )
