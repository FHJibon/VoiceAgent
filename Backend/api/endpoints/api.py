from fastapi import APIRouter
from .users import router as users_router
from .stats import router as stats_router
from .websocket import router as ws_router

router = APIRouter()

router.include_router(stats_router)
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(ws_router)