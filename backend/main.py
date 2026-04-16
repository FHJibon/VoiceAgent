import os
import secrets
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, HTTPException, Query, Path, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing import Optional
from pipeline import create_pipeline
from database import db

load_dotenv()

app = FastAPI(title="Voice Agent Backend", version="1.0.0")
security = HTTPBasic()


def verify_database_access(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    expected_username = os.getenv("DB_ADMIN_USERNAME")
    expected_password = os.getenv("DB_ADMIN_PASSWORD")

    username_ok = secrets.compare_digest(credentials.username, expected_username)
    password_ok = secrets.compare_digest(credentials.password, expected_password)

    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username

default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
extra_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
allowed_origins = list(dict.fromkeys(default_origins + extra_origins))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/database")
async def database_interface(_: str = Depends(verify_database_access)):
    """Serve the database interface"""
    return FileResponse('static/database.html', media_type='text/html')

@app.get("/")
async def root():
    return {"message": "Voice Agent Backend is running!"}

@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "api_key_loaded": bool(os.getenv('GEMINI_API_KEY')),
        "database": "connected",
        "total_users": db.get_user_count()
    }

@app.get("/users")
async def get_users(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    _: str = Depends(verify_database_access)
):
    """Get all users with optional search and pagination"""
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

@app.get("/users/{user_id}")
async def get_user_by_id(user_id: int, _: str = Depends(verify_database_access)):
    """Get specific user by ID"""
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/phone/{phone}")
async def get_user_by_phone(phone: str, _: str = Depends(verify_database_access)):
    """Get user by phone number"""
    try:
        user = db.get_user_by_phone(phone)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/recent/{days}")
async def get_recent_users(days: int = Path(ge=1, le=365), _: str = Depends(verify_database_access)):
    """Get users created in the last N days"""
    try:
        users = db.get_recent_users(days)
        return {
            "users": users,
            "days": days,
            "count": len(users)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, _: str = Depends(verify_database_access)):
    """Delete a user by ID"""
    try:
        success = db.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats(_: str = Depends(verify_database_access)):
    """Get database statistics"""
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

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    pipeline = create_pipeline()
    await pipeline.run(ws)

if __name__ == "__main__":
    import uvicorn
    print("Starting Voice Agent Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
