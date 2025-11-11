# src/progress.py
from __future__ import annotations
from typing import Optional, Dict
import httpx
import asyncio
import json
from .constants import settings
from .logger import get_logger

log = get_logger("progress")

# For this pipeline we report discrete stages; weights are illustrative if you later compute % automatically.
STAGE_WEIGHTS = {
    "received": 0.05,
    "extracting_main": 0.30,
    "extracting_reference": 0.15,
    "comparing": 0.15,
    "prompting": 0.25,
    "finalizing": 0.10,
    "completed": 1.00,
    "failed": 1.00,
}

def clamp_pct(pct: int) -> int:
    return max(0, min(100, int(pct)))

async def post_progress(
    progress_url: Optional[str],
    secret: Optional[str],
    *,
    percent: int,
    stage: str,
    meta: Optional[Dict] = None,
    status: Optional[str] = None,
    retries: int = 3,
    backoff_base: float = 1.0,
    verify_tls: bool = True,
) -> None:
    if not progress_url:
        log.warning("[progress] skipped: empty progress_url")
        return

    payload = {
        "percent": clamp_pct(percent),
        "stage": stage,
        "meta": meta or {},
        "status": status or "processing",
    }
    headers = {"x-ml-secret": (secret or settings.ML_CALLBACK_SECRET)}

    log.info(f"[progress] POST {progress_url} body={json.dumps(payload)[:200]} headers={{'x-ml-secret': '***'}}")

    for attempt in range(1, retries + 1):
        try:
            async with httpx.AsyncClient(timeout=15, verify=verify_tls) as client:
                resp = await client.post(progress_url, json=payload, headers=headers)
                if resp.status_code >= 400:
                    log.error(f"[progress] HTTP {resp.status_code} POST {progress_url} text={resp.text[:300]}")
                    resp.raise_for_status()
                else:
                    log.info(f"[progress] OK {resp.status_code} POST {progress_url}")
                return
        except Exception as e:
            log.error(f"[progress] attempt {attempt}/{retries} failed: {e}")
            if attempt == retries:
                log.critical(f"[progress] giving up POST {progress_url}")
                return
            await asyncio.sleep(backoff_base * attempt)
