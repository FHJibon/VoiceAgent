from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.endpoints.api import router as api_router

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

allowed_origins = [
    origin.strip()
    for origin in (settings.FRONTEND_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    print(f"Starting {settings.PROJECT_NAME}...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)