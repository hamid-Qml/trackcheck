# ---- Replace old models with these ----
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class PeakRms(BaseModel):
    linear: float = Field(..., description="RMS peak (linear 0–1)")
    dbfs: float = Field(..., description="RMS peak in dBFS")

class TimeRange(BaseModel):
    start: float
    end: float

class FxEvent(BaseModel):
    t: float
    type: str
    confidence: Optional[float] = None

class StructureSeg(BaseModel):
    start: float
    end: float
    label: Optional[str] = None
    energy: Optional[float] = None

class FeedbackQuery(BaseModel):
    genre: str
    feedback_type: str
    user_note: Optional[str] = None

class FeedbackMetadata(BaseModel):
    # General
    tempo: float
    key: str
    duration: float
    peak_rms: PeakRms

    # Spectral
    centroid: float
    rolloff: float
    bandwidth: float
    flatness: float

    # Dynamics & Energy
    energy_profile: List[Dict[str, float]]          # [{t,rms}]
    transients_info: List[float]                    # [t,...]
    silence_segments: List[Dict[str, Any]]          # [{start,end,label}]

    # Vocals
    vocal_timestamps: List[TimeRange]               # [{start,end}]
    vocal_intensity: Optional[float] = None

    # Structure & FX
    drop_timestamps: List[float]
    structure_segments: List[StructureSeg]
    structure: str
    fx_and_transitions: List[FxEvent]

class LLMUsage(BaseModel):
    model: str
    cost: Optional[float] = None
    usage: Dict[str, Any]

class FeedbackResponse(BaseModel):
    session_id: str
    feedback_text: str
    metadata: FeedbackMetadata
    query: FeedbackQuery
    llm: LLMUsage
