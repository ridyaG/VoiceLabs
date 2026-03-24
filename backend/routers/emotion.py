from fastapi import APIRouter, File, HTTPException, UploadFile

try:
    from ..models.emotion_model import emotion_classifier
    from ..utils.audio import cleanup_temp, save_temp_audio
    from ..utils.features import extract_emotion_features
except ImportError:
    from models.emotion_model import emotion_classifier
    from utils.audio import cleanup_temp, save_temp_audio
    from utils.features import extract_emotion_features

router = APIRouter()

@router.post("")
async def predict_emotion(audio: UploadFile = File(...)):
    """Predict the emotional state from speech audio."""
    temp_path = await save_temp_audio(audio)
    try:
        features = extract_emotion_features(temp_path)
        result = emotion_classifier.predict(features)
        return {"success": True, **result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_temp(temp_path)
