from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class UserModel(BaseModel):
    id: Optional[int] = None
    name: str
    phone: str
    job_title: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    session_data: Optional[Dict[str, Any]] = None

class FormSessionModel(BaseModel):
    id: Optional[int] = None
    session_id: str
    user_id: Optional[int] = None
    form_data: Optional[Dict[str, Any]] = None
    status: str = "in_progress"
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None