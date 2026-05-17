from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class UserSchema(BaseModel):
    id: int
    name: str
    phone: str
    job_title: str
    created_at: datetime
    updated_at: datetime
    session_data: Optional[Dict[str, Any]] = None

class UserListResponse(BaseModel):
    users: List[UserSchema]
    total: int
    limit: int
    offset: int

class StatsResponse(BaseModel):
    total_users: int
    users_today: int
    total_sessions: int
    users_last_7_days: int
    database_connected: bool

class RecentUsersResponse(BaseModel):
    users: List[UserSchema]
    days: int
    count: int

class DeleteSuccessResponse(BaseModel):
    message: str