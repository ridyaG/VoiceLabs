import speech_recognition as sr
from fastapi import APIRouter, File, HTTPException, UploadFile

try:
    from ..utils.audio import cleanup_temp, save_temp_audio
except ImportError:
    from utils.audio import cleanup_temp, save_temp_audio

router = APIRouter()

@router.post("")
async def recognize_speech(audio: UploadFile = File(...)):
    """Transcribe speech audio to text using Google Speech Recognition."""
    temp_path = await save_temp_audio(audio)
    try:
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_path) as source:
            audio_data = recognizer.record(source)

        text = recognizer.recognize_google(audio_data)
        return {"success": True, "transcript": text, "confidence": "high"}

    except sr.UnknownValueError:
        raise HTTPException(status_code=422, detail="Could not understand the audio. Please speak clearly.")
    except sr.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Speech recognition service unavailable: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_temp(temp_path)
