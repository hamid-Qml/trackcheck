from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class FeedbackQuery(BaseModel):
    genre: str = Field(..., description="User-selected genre")
    feedback_type: str = Field(..., description="Focus area requested by user, e.g., 'mix', 'arrangement'.")
    user_note: Optional[str] = Field(None, description="Optional freeform note from user")

class FeedbackMetadata(BaseModel):
    tempo: float
    key: str
    duration: float
    peak_rms: float
    centroid: float
    rolloff: float
    bandwidth: float
    energy_profile: List[Dict[str, float]]
    transients_info: List[float]
    vocal_timestamps: List[float]
    drop_timestamps: List[float]
    fx_and_transitions: List[Any]
    structure: str

class LLMUsage(BaseModel):
    model: str
    cost: float
    usage: dict

class FeedbackResponse(BaseModel):
    feedback_text: str
    metadata: FeedbackMetadata
    query: FeedbackQuery
    llm: LLMUsage
    session_id: str
