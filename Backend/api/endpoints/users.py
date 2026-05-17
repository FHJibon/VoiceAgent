from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Path, Depends
from services import db
from schemas import (
    UserSchema, 
    UserListResponse, 
    RecentUsersResponse, 
    DeleteSuccessResponse
)
from utils import verify_database_access

router = APIRouter()

@router.get("", response_model=UserListResponse)
async def get_users(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    _: str = Depends(verify_database_access)
):
    try:
        if search:
            users = db.search_users(search)
        else:
            users = db.get_all_users(limit=limit, offset=offset)
        
        return {
            "users": users,
            "total": db.get_user_count(),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/phone/{phone}", response_model=UserSchema)
async def get_user_by_phone(phone: str, _: str = Depends(verify_database_access)):
    try:
        user = db.get_user_by_phone(phone)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent/{days}", response_model=RecentUsersResponse)
async def get_recent_users(days: int = Path(ge=1, le=365), _: str = Depends(verify_database_access)):
    try:
        users = db.get_recent_users(days)
        return {
            "users": users,
            "days": days,
            "count": len(users)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserSchema)
async def get_user_by_id(user_id: int, _: str = Depends(verify_database_access)):
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}", response_model=DeleteSuccessResponse)
async def delete_user(user_id: int, _: str = Depends(verify_database_access)):
    try:
        success = db.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))