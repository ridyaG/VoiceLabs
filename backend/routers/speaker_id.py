from fastapi import APIRouter, File, Form, HTTPException, UploadFile

try:
    from ..models.speaker_store import speaker_store
    from ..utils.audio import cleanup_temp, save_temp_audio
    from ..utils.features import extract_mfcc
except ImportError:
    from models.speaker_store import speaker_store
    from utils.audio import cleanup_temp, save_temp_audio
    from utils.features import extract_mfcc

router = APIRouter()

@router.post("/enroll")
async def enroll_speaker(
    audio: UploadFile = File(...),
    speaker_name: str = Form(...)
):
    """Enroll a new speaker with a voice sample."""
    if not speaker_name.strip():
        raise HTTPException(status_code=400, detail="Speaker name cannot be empty.")

    temp_path = await save_temp_audio(audio)
    try:
        clean_name = speaker_name.strip()
        features = extract_mfcc(temp_path)
        speaker_store.add_speaker(clean_name, features)
        return {
            "success": True,
            "message": f"Speaker '{clean_name}' enrolled successfully.",
            "total_speakers": speaker_store.count()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_temp(temp_path)


@router.post("/identify")
async def identify_speaker(audio: UploadFile = File(...)):
    """Identify which enrolled speaker is in the audio."""
    if speaker_store.count() < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 enrolled speakers to identify.")

    temp_path = await save_temp_audio(audio)
    try:
        features = extract_mfcc(temp_path)
        result = speaker_store.identify(features)
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_temp(temp_path)


@router.get("/speakers")
def list_speakers():
    """List all enrolled speakers."""
    return {"speakers": speaker_store.list_speakers(), "count": speaker_store.count()}


@router.delete("/speakers/{name}")
def remove_speaker(name: str):
    """Remove an enrolled speaker."""
    removed = speaker_store.remove_speaker(name)
    if not removed:
        raise HTTPException(status_code=404, detail=f"Speaker '{name}' not found.")
    return {"success": True, "message": f"Speaker '{name}' removed."}
