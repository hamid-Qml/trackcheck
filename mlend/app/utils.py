import uuid, shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
from .constants import settings

ALLOWED_AUDIO = {".wav", ".mp3", ".flac", ".m4a", ".ogg"}

def secure_ext(pathlike: str) -> str:
    ext = Path(pathlike).suffix.lower()
    return ext

def assert_audio_file(f: UploadFile):
    ext = secure_ext(f.filename or "")
    if ext not in ALLOWED_AUDIO:
        raise HTTPException(status_code=400, detail=f"Unsupported audio type: {ext}")

def save_upload(file: UploadFile, target_dir: Path) -> Path:
    assert_audio_file(file)
    uid = uuid.uuid4().hex
    ext = Path(file.filename).suffix.lower()
    dst = target_dir / f"{uid}{ext}"
    with dst.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    return dst

def mb(bytes_: int) -> float:
    return round(bytes_ / (1024 * 1024), 2)

def size_guard(file: UploadFile):
    # UploadFile doesn't always know size; rely on web server limits in prod.
    pass

def short_text(s: str, n: int = 300) -> str:
    return s if len(s) <= n else s[: n - 3] + "..."
