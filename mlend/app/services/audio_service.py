# services/audio_service.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import librosa
from scipy.signal import butter, sosfilt
import webrtcvad  # REQUIRED
import math

# --------------------
# Tunables for payload size
# --------------------
MAX_ENERGY_POINTS = 512        # cap RMS time-series points
MAX_TRANSIENTS     = 128       # cap transient timestamps
MAX_VOCAL_SEGMENTS = 128       # cap VAD segments
MAX_FX_EVENTS      = 64        # cap fx markers
FX_CONF_MIN        = 0.50      # filter weak fx
MAX_STRUCTURE_SEGS = 128       # cap structure segments

# =========================
# Data container
# =========================
@dataclass
class AudioFeatures:
    tempo_bpm: float
    key_text: str               # "C minor" | "C major" etc.
    duration_sec: float
    peak_rms_linear: float
    peak_rms_dbfs: float
    spectral: Dict[str, float]
    dynamics: Dict[str, Any]
    vocals: Dict[str, Any]
    structure: Dict[str, Any]
    fx_transitions: Dict[str, Any]
    _debug: Dict[str, Any] | None = None

# =========================
# Small helpers
# =========================
def _downsample_series(times: np.ndarray, values: np.ndarray, max_points: int) -> Tuple[np.ndarray, np.ndarray]:
    if len(values) <= max_points:
        return times, values
    idx = np.linspace(0, len(values) - 1, num=max_points).astype(int)
    return times[idx], values[idx]

def _sample_list(xs: List[Any], max_len: int) -> List[Any]:
    if len(xs) <= max_len:
        return xs
    # even sampling over the list
    idx = np.linspace(0, len(xs) - 1, num=max_len).astype(int)
    return [xs[i] for i in idx]

def _estimate_key(y: np.ndarray, sr: int) -> str:
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1)
    pitch_class = int(chroma_mean.argmax())
    keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    # extremely simple maj/min heuristic; keep until Essentia/KH installed
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    is_minor = centroid < (sr / 8)
    return f"{keys[pitch_class]}{' minor' if is_minor else ' major'}"

def _onset_transients(y: np.ndarray, sr: int) -> Tuple[List[float], np.ndarray, np.ndarray]:
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(onset_env, sr=sr)
    peaks = librosa.util.peak_pick(onset_env, pre_max=16, post_max=16, pre_avg=16, post_avg=16, delta=0.7, wait=5)
    transients = [float(times[p]) for p in peaks]
    return transients, onset_env, times

def _silence_segments_from_rms(times: np.ndarray, rms: np.ndarray, thr: Optional[float] = None,
                               min_len: float = 0.2) -> List[Dict[str, float]]:
    if thr is None:
        thr = float(np.percentile(rms, 10))
    labels = (rms > thr).astype(int)
    segs: List[Dict[str, float]] = []
    start, cur = 0, labels[0]
    for i in range(1, len(labels)):
        if labels[i] != cur:
            t0, t1 = times[start], times[i-1]
            if (t1 - t0) >= min_len:
                segs.append({"start": float(t0), "end": float(t1), "label": "active" if cur else "silence"})
            start, cur = i, labels[i]
    t0, t1 = times[start], times[-1]
    if (t1 - t0) >= min_len:
        segs.append({"start": float(t0), "end": float(t1), "label": "active" if cur else "silence"})
    return segs

def _bandlimit(y, sr, lo=300, hi=3400):
    sos = butter(6, [lo, hi], btype="bandpass", fs=sr, output="sos")
    return sosfilt(sos, y)

def _vad_segments_webrtc(y: np.ndarray, sr: int,
                         aggressiveness: int = 2,
                         frame_ms: int = 30,
                         min_seg_ms: int = 300,
                         energy_gate_db: float = -45.0) -> List[Dict[str, float]]:
    # 1) band-limit to speech band
    y = _bandlimit(y, sr)

    # 2) energy gate
    eps = 1e-12
    rms_db = 20*np.log10(max(float(librosa.feature.rms(y=y)[0].mean()), eps))
    if rms_db < energy_gate_db:
        return []

    # 16 kHz mono PCM for VAD
    y16 = librosa.resample(y, orig_sr=sr, target_sr=16000)
    y16 = np.clip(y16, -1.0, 1.0)
    pcm16 = (y16 * 32767).astype(np.int16).tobytes()

    vad = webrtcvad.Vad(aggressiveness)
    bytes_per_frame = int(16000 * (frame_ms / 1000.0)) * 2
    frames = [pcm16[i:i + bytes_per_frame] for i in range(0, len(pcm16), bytes_per_frame)]
    flags = [vad.is_speech(fr, 16000) for fr in frames if len(fr) == bytes_per_frame]
    times = np.arange(len(flags)) * (frame_ms / 1000.0)

    # 3) simple timbre filter
    hop = int(16000 * (frame_ms / 1000.0))
    zcr = librosa.feature.zero_crossing_rate(y=y16, frame_length=2*hop, hop_length=hop)[0][:len(flags)]
    S = np.abs(librosa.stft(y16, n_fft=2*hop, hop_length=hop))
    flat = librosa.feature.spectral_flatness(S=S)[0][:len(flags)]
    speech_like = (flat < np.percentile(flat, 65)) & (zcr < np.percentile(zcr, 65))
    flags = [bool(f and s) for f, s in zip(flags, speech_like)]

    segs, start = [], None
    for i, f in enumerate(flags):
        if f and start is None:
            start = times[i]
        last = (i == len(flags)-1)
        if ((not f) or last) and start is not None:
            end = times[i] + (frame_ms/1000.0) if f and last else times[i]
            if (end - start) * 1000 >= min_seg_ms:
                segs.append({"start": float(start), "end": float(end)})
            start = None
    return segs

def _structure_segments_from_novelty(y: np.ndarray, sr: int, min_seg: float = 4.0) -> List[Dict[str, float]]:
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512)) ** 2
    flux = np.maximum(0, np.diff(S, axis=1)).sum(axis=0)
    flux = np.concatenate([[0.0], flux])
    times = librosa.times_like(flux, sr=sr, hop_length=512)
    thr = float(np.percentile(flux, 75))
    peaks = librosa.util.peak_pick(flux, pre_max=16, post_max=16, pre_avg=16, post_avg=16, delta=thr, wait=10)

    bounds = [0.0] + [float(times[p]) for p in peaks] + [float(times[-1])]
    segs: List[Dict[str, float]] = []
    last = bounds[0]
    for b in bounds[1:]:
        if (b - last) >= min_seg:
            segs.append({"start": float(last), "end": float(b)})
            last = b

    labeled: List[Dict[str, float]] = []
    p30, p70 = float(np.percentile(flux, 30)), float(np.percentile(flux, 70))
    for seg in segs:
        t0, t1 = seg["start"], seg["end"]
        i0, i1 = np.searchsorted(times, [t0, t1])
        energy = float(np.mean(flux[max(0, i0):max(i0+1, i1)]))
        if energy <= p30: label = "breakdown"
        elif energy >= p70: label = "build"
        else: label = "section"
        labeled.append({**seg, "label": label, "energy": energy})
    return labeled

def _detect_fx_transitions(y: np.ndarray, sr: int, boundaries: List[Dict[str, float]]) -> List[Dict[str, Any]]:
    hop = 512
    S_mag = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    centroid = librosa.feature.spectral_centroid(S=S_mag, sr=sr)[0]
    bandwidth = librosa.feature.spectral_bandwidth(S=S_mag, sr=sr)[0]
    zcr = librosa.feature.zero_crossing_rate(y=y, frame_length=2048, hop_length=hop)[0]
    times = librosa.times_like(centroid, sr=sr, hop_length=hop)

    fx: List[Dict[str, Any]] = []
    for seg in boundaries:
        t = float(seg["end"])
        pre, post = 2.0, 0.5
        i0, i1 = np.searchsorted(times, [max(0.0, t - pre), min(times[-1], t + post)])
        if i1 - i0 < 5:
            continue
        c, b, z = centroid[i0:i1], bandwidth[i0:i1], zcr[i0:i1]
        c_trend = float(np.polyfit(np.arange(len(c)), c, 1)[0]) if len(c) > 2 else 0.0
        b_trend = float(np.polyfit(np.arange(len(b)), b, 1)[0]) if len(b) > 2 else 0.0
        z_peak  = float(np.percentile(z, 95))

        if c_trend > 0 and b_trend > 0: fx.append({"t": t, "type": "riser",   "confidence": 0.6})
        if z_peak  > np.percentile(zcr, 90): fx.append({"t": t, "type": "glitch",  "confidence": 0.5})
        if len(c) > 6:
            left, right = float(np.mean(c[:len(c)//2])), float(np.mean(c[len(c)//2:]))
            if left > right * 1.2:           fx.append({"t": t, "type": "reverse", "confidence": 0.4})
        if float(np.mean(c[-3:])) > np.percentile(centroid, 85):
            fx.append({"t": t, "type": "sweep",   "confidence": 0.4})
    return fx

# =========================
# Main extractor
# =========================
def extract_features(path) -> AudioFeatures:
    y, sr = librosa.load(path, mono=True, sr=None)
    duration = float(librosa.get_duration(y=y, sr=sr))

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

    rms = librosa.feature.rms(y=y)[0]
    peak_rms_linear = float(np.max(rms))
    # protect against log of 0
    peak_rms_dbfs = float(20.0 * math.log10(max(peak_rms_linear, 1e-12)))

    centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    rolloff  = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))
    bandwidth = float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr)))
    flatness = float(np.mean(librosa.feature.spectral_flatness(y=y)))

    # Energy profile (downsampled)
    rms_times = librosa.times_like(rms, sr=sr)
    ds_t, ds_rms = _downsample_series(rms_times, rms, max_points=MAX_ENERGY_POINTS)
    energy_profile = [{"t": float(t), "rms": float(v)} for t, v in zip(ds_t, ds_rms)]

    # Transients
    transients, onset_env, onset_times = _onset_transients(y, sr)
    transients = _sample_list(transients, MAX_TRANSIENTS)

    # Simple “vocal intensity” proxy & VAD segments
    H, _ = librosa.effects.hpss(y)
    vocal_intensity = float(np.mean(np.abs(H)))  # proxy; keep for now
    vocal_sections = _sample_list(_vad_segments_webrtc(y, sr), MAX_VOCAL_SEGMENTS)

    # Drops from onset env
    drop_peaks = librosa.util.peak_pick(onset_env, pre_max=16, post_max=16, pre_avg=16, post_avg=16, delta=0.7, wait=5)
    drop_timestamps = [float(onset_times[p]) for p in drop_peaks]
    drop_timestamps = _sample_list(drop_timestamps, 64)

    # Structure & silence
    segments = _structure_segments_from_novelty(y, sr)
    segments = _sample_list(segments, MAX_STRUCTURE_SEGS)
    silence_segments = _silence_segments_from_rms(rms_times, rms)

    # FX (filter + cap)
    fx_notable = [e for e in _detect_fx_transitions(y, sr, segments) if e.get("confidence", 0) >= FX_CONF_MIN]
    fx_notable = _sample_list(fx_notable, MAX_FX_EVENTS)

    feats = AudioFeatures(
        tempo_bpm=float(tempo),
        key_text=_estimate_key(y, sr),            # "C minor" / "C major"
        duration_sec=duration,
        peak_rms_linear=peak_rms_linear,
        peak_rms_dbfs=peak_rms_dbfs,
        spectral={
            "centroid_hz": centroid,
            "rolloff_hz": rolloff,
            "bandwidth_hz": bandwidth,
            "flatness": flatness,                 # keep; acts as noisiness proxy
        },
        dynamics={
            "energy_profile": energy_profile,
            "transient_timestamps": transients,
            "silence_segments": silence_segments,
        },
        vocals={
            "vocal_segments": vocal_sections,
            "vocal_intensity": vocal_intensity,   # may be null/heuristic later
        },
        structure={
            "drop_timestamps": drop_timestamps,
            "segments": segments,
            "notes": "Segmented via novelty curve; labels are heuristic. Consider Essentia for robustness.",
        },
        fx_transitions={"events": fx_notable},
        _debug={
            "sr": sr,
            "onset_env": onset_env, "onset_times": onset_times,
            "rms": rms, "rms_times": rms_times,
        },
    )
    return feats

# =========================
# Payload adapter (prompt-ready + flat keys where needed)
# =========================
def features_to_payload(f: AudioFeatures) -> dict:
    # Flat keys the prompt expects, with explicit units in names where helpful.
    payload = {
        # General
        "tempo": round(f.tempo_bpm),
        "key": f.key_text,                            # "C minor"
        "duration": round(float(f.duration_sec), 2),  # seconds
        "peak_rms": {
            "linear": round(f.peak_rms_linear, 6),
            "dbfs": round(f.peak_rms_dbfs, 2)
        },

        # Spectral
        "centroid": round(f.spectral["centroid_hz"], 2),
        "rolloff": round(f.spectral["rolloff_hz"], 2),
        "bandwidth": round(f.spectral["bandwidth_hz"], 2),
        "flatness": round(f.spectral["flatness"], 6),

        # Dynamics & Energy
        "energy_profile": f.dynamics["energy_profile"],
        "transients_info": f.dynamics["transient_timestamps"],
        "silence_segments": f.dynamics.get("silence_segments", []),

        # Vocals
        "vocal_timestamps": f.vocals.get("vocal_segments", []),
        "vocal_intensity": f.vocals.get("vocal_intensity", None),

        # Structure & FX
        "drop_timestamps": f.structure["drop_timestamps"],
        "structure_segments": f.structure["segments"],
        "structure": f.structure.get("notes", ""),
        "fx_and_transitions": f.fx_transitions["events"],
    }
    return payload
