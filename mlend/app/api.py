# src/api.py
import json
import os
import traceback
from uuid import uuid4
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    status,
    FastAPI,
    BackgroundTasks,
    Header,
)
from pydantic import BaseModel, Field
from typing import Optional, List
from tempfile import NamedTemporaryFile
import httpx
import asyncio

from .models import FeedbackResponse, FeedbackMetadata, LLMUsage
from .constants import settings
from .services.audio_service import extract_features, features_to_payload
from .services.llm_service import MLService
from .prompts import assemble_messages, COMPARISON_USER_TEMPLATE
from .progress import post_progress  # our helper with retries + backoff

router = APIRouter(prefix="/v1", tags=["feedback"])

class FeedbackRequest(BaseModel):
    genre: str = Field(..., description="Selected genre, e.g. 'Techno'")
    feedback_type: str = Field(..., description="Focus area (e.g., Mix, Arrangement)")
    user_note: Optional[str] = Field(None, description="Optional user note or goal")

async def post_json_with_retries(url: str, payload: dict, secret: Optional[str], retries: int = 4, base: float = 1.2):
    headers = {"x-ml-secret": (secret or settings.ML_CALLBACK_SECRET)}
    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(1, retries + 1):
            try:
                r = await client.post(url, json=payload, headers=headers)
                if r.status_code >= 400:
                    # raise to enter except and retry
                    raise httpx.HTTPStatusError(f"{r.status_code} {r.text[:200]}", request=r.request, response=r)
                return
            except Exception as e:
                if attempt == retries:
                    raise
                await asyncio.sleep(base * attempt)

def _save_upload_local(f: UploadFile) -> str:
    tmp = NamedTemporaryFile(delete=False, suffix=os.path.splitext(f.filename or '')[-1])
    with open(tmp.name, "wb") as w:
        w.write(f.file.read())
    return tmp.name

def _cleanup(paths: List[str]):
    for p in paths:
        try:
            if os.path.exists(p):
                os.remove(p)
        except Exception:
            pass

async def _process_in_background(
    *,
    request_id: str,
    genre: str,
    feedback_type: str,
    user_note: Optional[str],
    main_path: str,
    ref_path: Optional[str],
    callback_url: Optional[str],
    progress_url: Optional[str],
    secret: Optional[str],
):
    llm = MLService(model_name=settings.MODEL_NAME)
    tmp_files = [main_path] + ([ref_path] if ref_path else [])

    try:
        # Progress: received
        await post_progress(progress_url, secret, percent=5, stage="received", status="processing")

        # 1) Extract main
        await post_progress(progress_url, secret, percent=15, stage="extracting_main", status="processing")
        main_features = extract_features(main_path)
        main_meta = features_to_payload(main_features)

        comparison_summary = None

        # 2) If reference → extract + compare
        if ref_path:
            await post_progress(progress_url, secret, percent=35, stage="extracting_reference", status="processing")
            ref_features = extract_features(ref_path)
            ref_meta = features_to_payload(ref_features)

            await post_progress(progress_url, secret, percent=50, stage="comparing", status="processing")
            comparison_messages = [
                {"role": "system", "content": "You are an expert mastering engineer and producer."},
                {
                    "role": "user",
                    "content": COMPARISON_USER_TEMPLATE.format(
                        genre=genre,
                        feedback_type=feedback_type,
                        user_note=user_note or "",
                        main_metadata_json=json.dumps(main_meta, indent=2),
                        ref_metadata_json=json.dumps(ref_meta, indent=2),
                    ),
                },
            ]
            comparison_text, _info = llm.call_llm(
                messages=comparison_messages,
                max_tokens=800,
                temperature=0.4,
                call_type="compare_main_reference",
            )
            try:
                comparison_summary = json.loads(comparison_text)
            except Exception:
                comparison_summary = {"summary_text": (comparison_text or "").strip()[:1000]}

        # 3) Final prompt
        await post_progress(progress_url, secret, percent=65, stage="prompting", status="processing")
        messages = assemble_messages(
            main_meta,
            genre=genre,
            feedback_type=feedback_type,
            user_note=user_note,
            has_reference=bool(ref_path),
            comparison_summary=comparison_summary,
        )

        content, info = llm.call_llm(
            messages=messages,
            max_tokens=1200,
            temperature=0.5,
            call_type="final_feedback",
        )

        # 4) Final callback
        await post_progress(progress_url, secret, percent=95, stage="finalizing", status="processing")
        payload = {
            "session_id": uuid4().hex,           # local session for ML
            "request_id": request_id,
            "upload_id": "<opaque>",             # optional to fill if you pass these down
            "reference_upload_id": "<opaque>" if ref_path else None,
            "feedback_text": content,
            "metadata": main_meta,
            "comparison_summary": comparison_summary,
            "query": {"genre": genre, "feedback_type": feedback_type, "user_note": user_note},
            "llm": {"model": info["model"], "usage": info.get("usage"), "cost": info.get("cost")},
            "prompt_version": "v1.1.0",
        }
        if callback_url:
            await post_json_with_retries(callback_url, payload, secret, retries=4, base=1.5)

        await post_progress(progress_url, secret, percent=100, stage="completed", status="completed")

    except Exception as e:
        # Report failure to backend
        try:
            if callback_url:
                await post_json_with_retries(
                    callback_url,
                    {
                        "session_id": uuid4().hex,
                        "request_id": request_id,
                        "error": f"{type(e).__name__}: {str(e)}",
                    },
                    secret,
                    retries=3,
                    base=1.5,
                )
            await post_progress(progress_url, secret, percent=100, stage="failed", status="failed", meta={"error": str(e)})
        finally:
            _cleanup(tmp_files)
        return

    _cleanup(tmp_files)

@router.post(
    "/feedback",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Kick off feedback; background process and callback when done",
    description="Upload one or two audio files. Work runs in background; progress + final callback will be sent.",
)
async def feedback_endpoint(
    background: BackgroundTasks,
    genre: str = Form(...),
    feedback_type: str = Form(...),
    user_note: Optional[str] = Form(None),
    request_id: Optional[str] = Form(None),
    callback_url: Optional[str] = Form(None),
    progress_url: Optional[str] = Form(None),
    audio_file: UploadFile = File(..., description="Primary audio file (WAV/MP3)"),
    reference_audio_file: Optional[UploadFile] = File(None, description="Optional reference track"),
    x_ml_secret: Optional[str] = Header(None),
):
    """
    Accepts large files, returns 202 quickly, and runs heavy work in a background task.
    """
    try:
      # save temp files
      main_path = _save_upload_local(audio_file)
      ref_path = _save_upload_local(reference_audio_file) if reference_audio_file else None

      background.add_task(
          _process_in_background,
          request_id=request_id or uuid4().hex,
          genre=genre,
          feedback_type=feedback_type,
          user_note=user_note,
          main_path=main_path,
          ref_path=ref_path,
          callback_url=callback_url,
          progress_url=progress_url,
          secret=(x_ml_secret or settings.ML_CALLBACK_SECRET),
      )

      # Immediate 202 – the actual output will arrive via callbacks
      return {"ok": True, "accepted": True, "request_id": request_id}

    except HTTPException:
      raise
    except Exception as e:
      traceback.print_exc()
      raise HTTPException(
          status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
          detail=f"Failed to enqueue processing: {str(e)}",
      )

# ===========================
# App Factory
# ===========================
def create_app() -> FastAPI:
    app = FastAPI(
        title="TrackCheck ML Backend (MLint)",
        version="1.1.0",
        description=(
            "Performs audio feature extraction, reference comparison, "
            "and GPT-based feedback generation for electronic music tracks."
        ),
    )
    app.include_router(router)
    return app


app = create_app()
