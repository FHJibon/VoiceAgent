from fastapi import APIRouter, HTTPException, Depends
from services import db
from schemas import StatsResponse
from core.config import settings
from utils import verify_database_access

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Form Engine Backend is running!"}

@router.get("/stats", response_model=StatsResponse)
async def get_stats(_: str = Depends(verify_database_access)):
    try:
        total_users = db.get_user_count()
        users_today = len(db.get_recent_users(1))
        recent_users = len(db.get_recent_users(7))
        total_sessions = db.get_form_session_count()
        
        return {
            "total_users": total_users,
            "users_today": users_today,
            "total_sessions": total_sessions,
            "users_last_7_days": recent_users,
            "database_connected": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))