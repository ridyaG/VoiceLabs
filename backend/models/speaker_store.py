import json
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

STORE_PATH = Path(__file__).resolve().parent.parent / "data" / "speakers.json"

class SpeakerStore:
    """
    In-memory store for speaker voice models.
    Maps speaker name → MFCC feature vector.
    """

    def __init__(self):
        self._store: Dict[str, np.ndarray] = {}
        self._load()

    def _load(self):
        if not STORE_PATH.exists():
            return

        try:
            payload = json.loads(STORE_PATH.read_text())
            self._store = {
                name: np.asarray(features, dtype=np.float32)
                for name, features in payload.items()
            }
        except Exception:
            self._store = {}

    def _save(self):
        STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            name: features.astype(np.float32).tolist()
            for name, features in self._store.items()
        }
        STORE_PATH.write_text(json.dumps(payload, indent=2, sort_keys=True))

    def add_speaker(self, name: str, features: np.ndarray):
        self._store[name] = np.asarray(features, dtype=np.float32)
        self._save()

    def has_speaker(self, name: str) -> bool:
        return name in self._store

    def get_speaker(self, name: str) -> Optional[np.ndarray]:
        return self._store.get(name)

    def remove_speaker(self, name: str) -> bool:
        if name in self._store:
            del self._store[name]
            self._save()
            return True
        return False

    def list_speakers(self) -> List[str]:
        return list(self._store.keys())

    def count(self) -> int:
        return len(self._store)

    def identify(self, features: np.ndarray) -> dict:
        """
        Find the best matching enrolled speaker using cosine similarity.
        Returns speaker name, similarity score, and a ranked list.
        """
        if not self._store:
            return {"identified_speaker": None, "similarity": 0.0, "rankings": []}

        names = list(self._store.keys())
        stored = np.array([self._store[n] for n in names])
        scores = cosine_similarity([features], stored)[0]

        rankings = sorted(
            [{"speaker": n, "score": round(float(s), 4), "pct": round(float(s)*100, 1)}
             for n, s in zip(names, scores)],
            key=lambda x: x["score"],
            reverse=True
        )

        top = rankings[0]
        return {
            "identified_speaker": top["speaker"],
            "similarity_score": top["score"],
            "confidence_pct": top["pct"],
            "rankings": rankings
        }


# Singleton instance used across all requests
speaker_store = SpeakerStore()
