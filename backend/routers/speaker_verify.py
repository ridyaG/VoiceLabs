from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sklearn.metrics.pairwise import cosine_similarity

try:
    from ..models.speaker_store import speaker_store
    from ..utils.audio import cleanup_temp, save_temp_audio
    from ..utils.features import extract_mfcc
except ImportError:
    from models.speaker_store import speaker_store
    from utils.audio import cleanup_temp, save_temp_audio
    from utils.features import extract_mfcc

router = APIRouter()

VERIFY_THRESHOLD = 0.75

@router.post("")
async def verify_speaker(
    audio: UploadFile = File(...),
    speaker_name: str = Form(...)
):
    """Verify if the audio matches the claimed speaker identity."""
    speaker_name = speaker_name.strip()
    if not speaker_name:
        raise HTTPException(status_code=400, detail="Speaker name cannot be empty.")

    if not speaker_store.has_speaker(speaker_name):
        raise HTTPException(
            status_code=404,
            detail=f"Speaker '{speaker_name}' is not enrolled. Please enroll first."
        )

    temp_path = await save_temp_audio(audio)
    try:
        input_features = extract_mfcc(temp_path)
        stored_features = speaker_store.get_speaker(speaker_name)

        similarity = float(
            cosine_similarity([stored_features], [input_features])[0][0]
        )
        verified = similarity >= VERIFY_THRESHOLD
        confidence_pct = round(similarity * 100, 1)

        return {
            "success": True,
            "speaker_name": speaker_name,
            "verified": verified,
            "similarity_score": round(similarity, 4),
            "confidence_pct": confidence_pct,
            "threshold": VERIFY_THRESHOLD,
            "message": (
                f"✅ Identity confirmed ({confidence_pct}% match)"
                if verified
                else f"❌ Identity not confirmed ({confidence_pct}% match, threshold: {VERIFY_THRESHOLD*100}%)"
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_temp(temp_path)
