import os
import json
import time
import re
import base64
import requests
import tiktoken
from dotenv import load_dotenv
from ..logger import get_logger
import asyncio, random, httpx

load_dotenv()
logger = get_logger(__name__)


class MLService:
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not set.")
        self.model = model_name
        self.encoding = tiktoken.encoding_for_model(model_name)

    def count_tokens(self, text: str) -> int:
        return len(self.encoding.encode(text))

    def base64_image(self, image_path: str) -> str:
        """Helper to convert image file to base64 string."""
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def call_llm(
        self,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        response_format: str = "text",
        call_type: str = "llm_call",
        max_retries: int = 10,          # up to 10 total attempts
        backoff_start: float = 10.0,    # start with 10s
        backoff_cap: float = 120.0,     # cap at 120s
    ):
        model = model or self.model
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format != "text":
            payload["response_format"] = {"type": response_format}

        backoff = backoff_start

        for attempt in range(1, max_retries + 1):
            try:
                resp = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=120,  # be generous in serverless environments
                )

                # Retryable statuses
                if resp.status_code in (429, 500, 502, 503, 504):
                    if attempt < max_retries:
                        ra = resp.headers.get("Retry-After")
                        if ra:
                            try:
                                wait_sec = float(ra) + 1.0
                            except Exception:
                                wait_sec = backoff
                        else:
                            wait_sec = backoff
                        logger.warning(
                            f"[{call_type}] HTTP {resp.status_code}; retrying in {wait_sec:.2f}s "
                            f"(attempt {attempt}/{max_retries})"
                        )
                        time.sleep(wait_sec)
                        backoff = min(backoff * 1.5, backoff_cap)
                        continue
                    else:
                        # out of retries -> raise with body excerpt
                        body = resp.text[:500] if resp.text else ""
                        logger.error(f"[{call_type}] HTTP {resp.status_code} after {attempt} attempts: {body}")
                        resp.raise_for_status()

                # Non-retryable errors -> raise
                resp.raise_for_status()

                # Success
                result = resp.json()
                # Defensive parsing
                choices = result.get("choices") or []
                if not choices or "message" not in choices[0] or "content" not in choices[0]["message"]:
                    raise RuntimeError(f"[{call_type}] invalid response payload (missing choices/message/content)")

                content = choices[0]["message"]["content"]
                if not isinstance(content, str):
                    raise RuntimeError(f"[{call_type}] invalid content type: {type(content).__name__}")

                usage = result.get("usage", {})
                return content, {
                    "type": call_type,
                    "model": model,
                    "usage": usage,
                    "cost": self.calculate_text_model_cost(usage, model),
                }

            except (requests.Timeout, requests.ConnectionError) as e:
                if attempt < max_retries:
                    logger.warning(
                        f"[{call_type}] network error: {e}. Retrying in {backoff:.2f}s "
                        f"(attempt {attempt}/{max_retries})"
                    )
                    time.sleep(backoff)
                    backoff = min(backoff * 1.5, backoff_cap)
                    continue
                logger.error(f"[{call_type}] network error, giving up after {attempt} attempts: {e}")
                raise

            except requests.HTTPError:
                # Already logged above for retryable statuses; just re-raise to propagate details.
                raise

            except Exception as e:
                # Unexpected error path: don't silently return None—fail loudly.
                logger.error(f"[{call_type}] unexpected error: {e}")
                raise

        # If the loop exits without returning, treat as exhausted.
        raise RuntimeError(f"[{call_type}] exhausted retries without success")

    async def call_llm_async(
        self, 
        *,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        response_format: str = "text",
        call_type: str = "llm_call_async",
        max_retries: int = 10,                 # was 3
        client: httpx.AsyncClient = None,
        backoff_start: float = 10.0,           # NEW: long starting backoff
        backoff_cap: float = 120.0,            # NEW: allow large cap
    ):
        model = model or self.model
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format != "text":
            payload["response_format"] = {"type": response_format}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        backoff = backoff_start
        _own_client = client is None
        if _own_client:
            client = httpx.AsyncClient(timeout=120)  # was 45/60; give Cloud Run more room

        try:
            for attempt in range(1, max_retries + 1):
                try:
                    r = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers=headers,
                        json=payload,
                    )

                    # Retryable HTTPs
                    if r.status_code in (429, 500, 502, 503, 504):
                        ra = r.headers.get("Retry-After")
                        wait = (float(ra) + 1.0) if ra else backoff + random.uniform(0, 0.5)
                        logger.warning(f"[{call_type}] {r.status_code}; sleeping {wait:.2f}s (attempt {attempt}/{max_retries})")
                        await asyncio.sleep(wait)
                        backoff = min(backoff * 1.5, backoff_cap)
                        continue

                    # Non-retryable HTTP errors -> raise
                    r.raise_for_status()

                    # Success
                    result = r.json()
                    content = result["choices"][0]["message"]["content"]
                    usage = result.get("usage", {})
                    return content, {
                        "type": call_type,
                        "model": model,
                        "usage": usage,
                        "cost": self.calculate_text_model_cost(usage, model),
                    }

                except (httpx.ConnectTimeout, httpx.ReadTimeout, httpx.TransportError) as e:
                    if attempt < max_retries:
                        wait = backoff + random.uniform(0, 0.5)
                        logger.warning(f"[{call_type}] network error {e}; retrying in {wait:.2f}s (attempt {attempt}/{max_retries})")
                        await asyncio.sleep(wait)
                        backoff = min(backoff * 1.5, backoff_cap)
                        continue
                    logger.error(f"[{call_type}] network error, giving up after {attempt} attempts: {e}")
                    raise

            # Exhausted loop without return
            raise RuntimeError(f"[{call_type}] exhausted retries without success")

        finally:
            if _own_client:
                await client.aclose()

    def calculate_text_model_cost(self, usage: dict, model_name: str) -> float:
        pricing = {
            "gpt-4o-mini": {"prompt": 0.15, "prompt_cached": 0.075, "completion": 0.60},
            "gpt-4o": {"prompt": 2.50, "prompt_cached": 1.25, "completion": 10.00},
            "gpt-4.1-mini": {"prompt": 0.40, "prompt_cached": 0.10, "completion": 1.60},
        }

        if model_name not in pricing:
            return 0.0

        prompt_tokens = usage.get("prompt_tokens", 0)
        cached_tokens = usage.get("prompt_tokens_details", {}).get("cached_tokens", 0)
        live_prompt = prompt_tokens - cached_tokens
        completion_tokens = usage.get("completion_tokens", 0)

        p = pricing[model_name]
        cost = (
            (live_prompt * p["prompt"]) +
            (cached_tokens * p["prompt_cached"]) +
            (completion_tokens * p["completion"])
        ) / 1_000_000
        return round(cost, 6)
