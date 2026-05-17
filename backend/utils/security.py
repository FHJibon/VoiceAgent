import secrets
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from core.config import settings

security = HTTPBasic()

def verify_database_access(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    expected_username = settings.DB_ADMIN_USERNAME
    expected_password = settings.DB_ADMIN_PASSWORD

    username_ok = secrets.compare_digest(credentials.username, expected_username)
    password_ok = secrets.compare_digest(credentials.password, expected_password)

    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username