import os
from pydantic_settings import BaseSettings
from typing import List

def get_database_url() -> str:
    raw = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or ""
    if raw:
        if raw.startswith("postgres://"):
            raw = raw.replace("postgres://", "postgresql+psycopg2://", 1)
        elif raw.startswith("postgresql://"):
            raw = raw.replace("postgresql://", "postgresql+psycopg2://", 1)
        raw = raw.replace("channel_binding=require&", "").replace("&channel_binding=require", "").replace("channel_binding=require", "")
        return raw
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return "sqlite:////tmp/polarise_telecom.db"
    return "sqlite:///./polarise_telecom.db"

class Settings(BaseSettings):
    APP_NAME: str = "Polarise Telecom Technology"
    CLIENT_NAME: str = "Polaris Educational Consultancy"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "polarise-telecom-insecure-secret-key-for-dev-only-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours
    
    # Database (supports persistent Cloud Postgres and serverless fallback)
    is_serverless: bool = os.getenv("VERCEL") is not None or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None
    DATABASE_URL: str = get_database_url()
    
    # Telephony
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    EXOTEL_ACCOUNT_SID: str = os.getenv("EXOTEL_ACCOUNT_SID", "")
    EXOTEL_API_KEY: str = os.getenv("EXOTEL_API_KEY", "")
    EXOTEL_API_TOKEN: str = os.getenv("EXOTEL_API_TOKEN", "")
    EXOTEL_SUBDOMAIN: str = os.getenv("EXOTEL_SUBDOMAIN", "api.exotel.com")
    EXOTEL_VIRTUAL_NUMBER: str = os.getenv("EXOTEL_VIRTUAL_NUMBER", "+918047190000")
    EXOTEL_WEBHOOK_SECRET: str = os.getenv("EXOTEL_WEBHOOK_SECRET", "polarise-webhook-secret-token")
    
    # Storage
    RECORDINGS_DIR: str = os.getenv("RECORDINGS_DIR", "./data/recordings")
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", "./data/reports")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
