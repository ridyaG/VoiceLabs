import os
import tempfile
import uuid

from fastapi import HTTPException, UploadFile

TEMP_DIR = tempfile.gettempdir()

ALLOWED_FORMATS = {".wav", ".mp3", ".ogg", ".flac", ".m4a", ".webm"}

async def save_temp_audio(upload: UploadFile) -> str:
    """Save an uploaded audio file to a temporary path and return the path."""
    if upload is None:
        raise HTTPException(status_code=400, detail="Audio upload is required.")

    ext = os.path.splitext(upload.filename or "audio.wav")[1].lower() or ".wav"
    if ext not in ALLOWED_FORMATS:
        ext = ".wav"

    temp_path = os.path.join(TEMP_DIR, f"voicelab_{uuid.uuid4().hex}{ext}")
    content = await upload.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    with open(temp_path, "wb") as f:
        f.write(content)
    return temp_path


def cleanup_temp(path: str):
    """Remove a temporary file if it exists."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception:
        pass  # Best-effort cleanup
