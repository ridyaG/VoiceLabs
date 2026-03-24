import numpy as np
import librosa
from typing import Dict, Any


EMOTIONS = {
    "happy":   {"emoji": "😊", "color": "#FFD700", "desc": "Joyful & positive energy"},
    "sad":     {"emoji": "😢", "color": "#6495ED", "desc": "Low energy, melancholic tone"},
    "angry":   {"emoji": "😠", "color": "#FF4444", "desc": "High intensity, tense"},
    "fearful": {"emoji": "😨", "color": "#9B59B6", "desc": "Anxious, unsettled"},
    "neutral": {"emoji": "😐", "color": "#95A5A6", "desc": "Calm, baseline affect"},
    "surprised": {"emoji": "😲", "color": "#FF8C00", "desc": "Sudden exclamation"},
    "disgusted": {"emoji": "🤢", "color": "#27AE60", "desc": "Strong aversion expressed"},
}


class EmotionClassifier:
    """
    Heuristic-based emotion classifier using low-level audio features.
    No training required — uses energy, pitch, and rhythm as cues.

    Swap out predict() internals for a trained SVM/RandomForest when you
    have labelled data (e.g. RAVDESS dataset).
    """

    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        # Re-derive signal-level stats from the feature vector
        # features layout: 40 mfcc_mean | 40 mfcc_std | 40 delta_mean | zcr | rms | centroid | 12 chroma
        mfcc_mean   = features[:40]
        mfcc_std    = features[40:80]
        rms         = features[121]   # index 120 = zcr, 121 = rms, 122 = centroid
        zcr         = features[120]
        centroid    = features[122]

        # --- Heuristic rules ---
        energy       = float(rms)
        pitch_proxy  = float(centroid)
        variability  = float(np.mean(mfcc_std))
        brightness   = float(np.mean(mfcc_mean[1:5]))

        scores = {
            "neutral":   0.3,
            "happy":     0.0,
            "sad":       0.0,
            "angry":     0.0,
            "fearful":   0.0,
            "surprised": 0.0,
            "disgusted": 0.0,
        }

        if energy > 0.1 and pitch_proxy > 2500 and variability > 15:
            scores["angry"]   += 0.5
            scores["happy"]   += 0.2
        elif energy > 0.08 and pitch_proxy > 2000:
            scores["happy"]   += 0.45
            scores["surprised"] += 0.2
        elif energy < 0.03 and pitch_proxy < 1500:
            scores["sad"]     += 0.5
            scores["neutral"] += 0.2
        elif energy < 0.05 and variability < 8:
            scores["neutral"] += 0.5
            scores["sad"]     += 0.1
        elif variability > 20 and energy > 0.06:
            scores["fearful"] += 0.4
            scores["surprised"] += 0.2
        elif brightness < -5:
            scores["disgusted"] += 0.35
            scores["sad"]       += 0.2
        else:
            scores["neutral"] += 0.3

        # Softmax normalisation
        vals = np.array(list(scores.values()))
        vals = np.exp(vals - np.max(vals))
        vals /= vals.sum()
        prob_dict = dict(zip(scores.keys(), vals.tolist()))

        predicted = max(prob_dict, key=prob_dict.get)
        meta = EMOTIONS[predicted]

        all_emotions = [
            {
                "emotion": e,
                "probability": round(p * 100, 1),
                **EMOTIONS[e]
            }
            for e, p in sorted(prob_dict.items(), key=lambda x: -x[1])
        ]

        return {
            "predicted_emotion": predicted,
            "emoji": meta["emoji"],
            "color": meta["color"],
            "description": meta["desc"],
            "confidence_pct": round(prob_dict[predicted] * 100, 1),
            "all_emotions": all_emotions,
        }


emotion_classifier = EmotionClassifier()
