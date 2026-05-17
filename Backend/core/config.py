import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Form Engine Backend"
    VERSION: str = "1.0.0"

    VERTEX_MODEL: str = os.getenv("VERTEX_MODEL")
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION")
    GOOGLE_SERVICE_ACCOUNT_JSON: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT")
    DB_NAME: str = os.getenv("DB_NAME")
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    
    DB_ADMIN_USERNAME: str = os.getenv("DB_ADMIN_USERNAME")
    DB_ADMIN_PASSWORD: str = os.getenv("DB_ADMIN_PASSWORD")
    FRONTEND_ORIGINS: str = os.getenv("FRONTEND_ORIGINS")

settings = Settings()