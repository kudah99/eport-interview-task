from fastapi import APIRouter

from app.api.v1 import admin, auth, warranty

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(warranty.router, prefix="/warranty", tags=["warranty"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
