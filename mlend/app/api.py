from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from .models import FeedbackQuery, FeedbackResponse, FeedbackMetadata, LLMUsage
from .constants import settings
from .utils import save_upload
from .services.audio_service import extract_features, features_to_payload
from .services.llm_service import MLService
from .prompts import assemble_messages
from uuid import uuid4

router = APIRouter(prefix="/v1", tags=["feedback"])

@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    summary="Request expert feedback for an uploaded track",
    description="""
Upload an audio file (WAV/MP3/etc.) and optionally a reference track.
The backend extracts audio features (tempo, key, spectral/dynamics/structure),
assembles a domain prompt, calls the LLM, and returns the formatted feedback
plus the computed metadata.
""",
    status_code=status.HTTP_200_OK,
)
async def feedback(
    genre: str = Form(..., description="Selected genre"),
    feedback_type: str = Form(..., description="Focus area (e.g., mix, arrangement)"),
    user_note: Optional[str] = Form(None, description="Optional note for the reviewer"),
    audio_file: UploadFile = File(..., description="Primary audio file"),
    reference_audio_file: Optional[UploadFile] = File(None, description="Optional reference audio"),
):
    # Save uploads
    primary_path = save_upload(audio_file, settings.UPLOADS_DIR)
    has_ref = False
    if reference_audio_file:
        _ = save_upload(reference_audio_file, settings.UPLOADS_DIR)
        has_ref = True

    # Extract features
    features = extract_features(primary_path)
    meta = features_to_payload(features)

    # Assemble prompt
    messages = assemble_messages(meta, genre=genre, feedback_type=feedback_type, user_note=user_note, has_reference=has_ref)

    # Call LLM
    llm = MLService(model_name=settings.MODEL_NAME)
    content, info = llm.call_llm(messages=messages, max_tokens=900, temperature=0.5)

    resp = FeedbackResponse(
        feedback_text=content,
        metadata=FeedbackMetadata(**meta),
        query={"genre": genre, "feedback_type": feedback_type, "user_note": user_note},
        llm=LLMUsage(model=info["model"], cost=info["cost"], usage=info["usage"]),
        session_id=uuid4().hex,
    )
    return resp
