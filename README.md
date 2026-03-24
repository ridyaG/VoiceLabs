# 🎙 VoiceLab — Integrated Speech Intelligence Platform

A full-stack, deployable speech intelligence app combining 4 projects into one polished interface.

| Module | Project | Tech |
|--------|---------|------|
| Speech Recognition | #681 | Google Speech API + SpeechRecognition |
| Speaker Identification | #682 | MFCC + Cosine Similarity |
| Speaker Verification | #683 | MFCC + Cosine Similarity threshold |
| Emotion Detection | #684 | MFCC + Energy + Pitch heuristics |

**Stack:** FastAPI · React 18 · librosa · scikit-learn · Docker · Render

---

## 📁 Project Structure

```
voicelab/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── routers/
│   │   ├── speech_recognition.py
│   │   ├── speaker_id.py
│   │   ├── speaker_verify.py
│   │   └── emotion.py
│   ├── models/
│   │   ├── speaker_store.py     # In-memory speaker registry
│   │   └── emotion_model.py     # Heuristic emotion classifier
│   ├── utils/
│   │   ├── audio.py             # File upload helpers
│   │   └── features.py          # MFCC / feature extraction
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js               # Router
│   │   ├── api.js               # Axios API layer
│   │   ├── components/
│   │   │   ├── Layout.js        # Sidebar nav
│   │   │   ├── AudioDropzone.js # Drag-drop + mic recorder
│   │   │   └── PageHeader.js
│   │   └── pages/
│   │       ├── Home.js
│   │       ├── RecognizePage.js
│   │       ├── SpeakerIdPage.js
│   │       ├── VerifyPage.js
│   │       └── EmotionPage.js
│   ├── public/index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── render.yaml
└── .gitignore
```

---

## 🚀 Quick Start (Local)

### Option A — Docker Compose (recommended)

```bash
# 1. Clone your repo
git clone https://github.com/YOUR_USERNAME/voicelab.git
cd voicelab

# 2. Start everything
docker-compose up --build

# 3. Open in browser
# Frontend: http://localhost:3000
# API docs:  http://localhost:8000/docs
```

### Option B — Manual (no Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start                       # Proxies API calls to :8000
```

---

## 📦 Push to GitHub

```bash
# Inside the voicelab/ folder:
git init
git add .
git commit -m "feat: initial VoiceLab commit"
git branch -M main

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/voicelab.git
git push -u origin main
```

---

## ☁️ Deploy to Render (Free Tier)

1. Push code to GitHub (steps above)
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and creates **both services**
5. Click **Apply** — deploy takes ~5 minutes
6. Your URLs will be:
   - API: `https://voicelab-api.onrender.com`
   - App: `https://voicelab-frontend.onrender.com`

> ⚠️ **Free tier note:** Render spins down free services after 15 min of inactivity.
> First request may take ~30s to wake up. Upgrade to Starter ($7/mo) to avoid this.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/recognize` | Transcribe audio → text |
| `POST` | `/api/speaker-id/enroll` | Enroll a new speaker |
| `POST` | `/api/speaker-id/identify` | Identify speaker from audio |
| `GET`  | `/api/speaker-id/speakers` | List enrolled speakers |
| `DELETE` | `/api/speaker-id/speakers/{name}` | Remove a speaker |
| `POST` | `/api/verify` | Verify speaker identity |
| `POST` | `/api/emotion` | Detect emotion from audio |
| `GET`  | `/health` | Health check |

Interactive docs: `http://localhost:8000/docs`

---

## 🧪 Testing the API manually

```bash
# Health check
curl http://localhost:8000/health

# Transcribe a WAV file
curl -X POST http://localhost:8000/api/recognize \
  -F "audio=@sample.wav"

# Enroll a speaker
curl -X POST http://localhost:8000/api/speaker-id/enroll \
  -F "audio=@alice.wav" -F "speaker_name=Alice"

# Identify speaker
curl -X POST http://localhost:8000/api/speaker-id/identify \
  -F "audio=@unknown.wav"

# Verify identity
curl -X POST http://localhost:8000/api/verify \
  -F "audio=@sample.wav" -F "speaker_name=Alice"

# Detect emotion
curl -X POST http://localhost:8000/api/emotion \
  -F "audio=@sample.wav"
```

---

## 🔮 Upgrading Emotion Detection (optional)

The default emotion classifier uses heuristics (energy + pitch + MFCC).
To train a real ML model with the **RAVDESS dataset**:

```python
# In backend/models/emotion_model.py, replace predict() with:
from sklearn.svm import SVC
import joblib

# Training (run once):
# model = SVC(kernel='rbf', probability=True)
# model.fit(X_train, y_train)
# joblib.dump(model, 'emotion_svm.pkl')

# Inference:
# model = joblib.load('emotion_svm.pkl')
# probs = model.predict_proba([features])[0]
```

Download RAVDESS free: https://zenodo.org/record/1188976

---

## 📄 License

MIT — free to use, modify, and deploy.
