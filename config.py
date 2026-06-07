import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Database
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "class_harmony")
    
    # Application
    APP_NAME: str = "IAA-CLASS TIMETABLE-SYSTEM"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:8080"]
    
    class Config:
        env_file = ".env.local"
        case_sensitive = True

settings = Settings()
