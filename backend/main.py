from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models.speaker_store import speaker_store
    from .routers import emotion, speaker_id, speaker_verify, speech_recognition
except ImportError:
    from models.speaker_store import speaker_store
    from routers import emotion, speaker_id, speaker_verify, speech_recognition

app = FastAPI(
    title="VoiceLab API",
    description="Integrated Speech Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(speech_recognition.router, prefix="/api/recognize",   tags=["Speech Recognition"])
app.include_router(speaker_id.router,         prefix="/api/speaker-id",   tags=["Speaker Identification"])
app.include_router(speaker_verify.router,     prefix="/api/verify",       tags=["Speaker Verification"])
app.include_router(emotion.router,            prefix="/api/emotion",      tags=["Emotion Recognition"])

@app.get("/")
def root():
    return {"status": "VoiceLab API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "VoiceLab API",
        "enrolled_speakers": speaker_store.count(),
    }
