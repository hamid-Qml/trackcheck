from pydantic import BaseModel
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

class Settings(BaseModel):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o-mini")

    # Upload limits
    MAX_FILE_MB: int = int(os.getenv("MAX_FILE_MB", "100"))
    MAX_DURATION_SEC: int = int(os.getenv("MAX_DURATION_SEC", "420"))  # <7 min

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOADS_DIR: Path = STORAGE_DIR / "uploads"
    CLIPS_DIR: Path = STORAGE_DIR / "clips"

settings = Settings()

# Ensure dirs exist at import-time
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.CLIPS_DIR.mkdir(parents=True, exist_ok=True)
