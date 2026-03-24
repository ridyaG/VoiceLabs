import numpy as np
import librosa

def extract_mfcc(file_path: str, n_mfcc: int = 13) -> np.ndarray:
    """
    Extract MFCC features from an audio file.
    Returns the mean of each coefficient across time frames.
    """
    audio, sr = librosa.load(file_path, sr=None, mono=True)
    if audio.size == 0:
        raise ValueError("Audio could not be decoded.")

    if audio.size < 2048:
        audio = np.pad(audio, (0, 2048 - audio.size))

    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    return np.mean(mfcc, axis=1).astype(np.float32)


def extract_emotion_features(file_path: str) -> np.ndarray:
    """
    Extract a richer feature set for emotion recognition:
    MFCC + delta-MFCC + ZCR + RMS energy + spectral features.
    """
    audio, sr = librosa.load(file_path, sr=22050, mono=True)
    if audio.size == 0:
        raise ValueError("Audio could not be decoded.")

    if audio.size < 4096:
        audio = np.pad(audio, (0, 4096 - audio.size))

    # MFCCs
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    mfcc_mean = np.mean(mfcc, axis=1)
    mfcc_std  = np.std(mfcc, axis=1)

    # Delta MFCCs
    delta_mfcc = librosa.feature.delta(mfcc)
    delta_mean = np.mean(delta_mfcc, axis=1)

    # Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(audio)
    zcr_mean = np.mean(zcr)

    # RMS Energy
    rms = librosa.feature.rms(y=audio)
    rms_mean = np.mean(rms)

    # Spectral Centroid
    centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
    centroid_mean = np.mean(centroid)

    # Chroma
    chroma = librosa.feature.chroma_stft(y=audio, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)

    features = np.concatenate([
        mfcc_mean, mfcc_std, delta_mean,
        [zcr_mean, rms_mean, centroid_mean],
        chroma_mean
    ])
    return features.astype(np.float32)
