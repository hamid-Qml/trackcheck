from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any, Optional, List
import numpy as np
import librosa
import soundfile as sf


@dataclass
class AudioFeatures:
    tempo: float
    key: str
    duration: float
    peak_rms: float
    spectral: Dict[str, float]
    dynamics: Dict[str, Any]
    vocals: Dict[str, Any]
    structure: Dict[str, Any]
    fx_transitions: Dict[str, Any]


def _estimate_key(y: np.ndarray, sr: int) -> str:
    # Lightweight key estimation (placeholder). Replace with Essentia for accuracy.
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1)
    pitch_class = chroma_mean.argmax()
    keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    # naive major/minor toggle via spectral centroid heuristics
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    is_minor = centroid < (sr/8)
    return f"{keys[pitch_class]}{'m' if is_minor else ''}"


def extract_features(path) -> AudioFeatures:
    y, sr = librosa.load(path, mono=True, sr=None)
    duration = librosa.get_duration(y=y, sr=sr)

    # Tempo
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

    # RMS / Peak RMS
    rms = librosa.feature.rms(y=y)[0]
    peak_rms = float(np.max(rms))

    # Spectral stats
    centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))
    bandwidth = float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr)))
    flatness = float(np.mean(librosa.feature.spectral_flatness(y=y)))

    # Dynamics / Energy profile
    rms_times = librosa.times_like(rms, sr=sr)
    energy_profile = [{"t": float(t), "rms": float(v)}
                      for t, v in zip(rms_times, rms)]
    # simple transient detection: local maxima above threshold
    diff = np.diff(rms, prepend=rms[0])
    thr = np.percentile(diff, 95)
    transients = [float(rms_times[i]) for i in np.where(diff > thr)[0]]

    # (Very rough) speech/music / vocal proxy via harmonic-percussive and spectral flatness
    H, P = librosa.effects.hpss(y)
    vocal_intensity = float(np.mean(np.abs(H)))
    vocal_sections = []  # placeholder: integrate VAD model for real timestamps

    # Structure (coarse): use novelty function + peak-picking to guess “drops”
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(onset_env, sr=sr)
    peaks = librosa.util.peak_pick(
        onset_env,
        pre_max=16,
        post_max=16,
        pre_avg=16,
        post_avg=16,
        delta=0.7,
        wait=5,
    )
    drop_timestamps = [float(times[p]) for p in peaks[:5]]

    features = AudioFeatures(
        tempo=float(tempo),
        key=_estimate_key(y, sr),
        duration=float(duration),
        peak_rms=peak_rms,
        spectral={
            "centroid": centroid,
            "rolloff": rolloff,
            "bandwidth": bandwidth,
            "flatness": flatness,
        },
        dynamics={
            "energy_profile": energy_profile,
            "transients": transients,
        },
        vocals={
            "vocal_intensity": vocal_intensity,
            "vocal_timestamps": vocal_sections,
        },
        structure={
            "drop_timestamps": drop_timestamps,
            "notes": "Heuristic segmentation; replace with Essentia or dedicated model.",
        },
        fx_transitions={
            "notable": [],
        },
    )
    return features


def features_to_payload(f: AudioFeatures) -> dict:
    return {
        "tempo": f.tempo,
        "key": f.key,
        "duration": f.duration,
        "peak_rms": f.peak_rms,
        "centroid": f.spectral["centroid"],
        "rolloff": f.spectral["rolloff"],
        "bandwidth": f.spectral["bandwidth"],
        "energy_profile": f.dynamics["energy_profile"],
        "transients_info": f.dynamics["transients"],
        "vocal_timestamps": f.vocals["vocal_timestamps"],
        "drop_timestamps": f.structure["drop_timestamps"],
        "fx_and_transitions": f.fx_transitions["notable"],
        "structure": f.structure.get("notes", ""),
    }
