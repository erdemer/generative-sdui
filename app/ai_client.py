import json
import re
import time
from google import genai
from google.genai import types
from google.genai.errors import ClientError, ServerError
from app.config import GOOGLE_API_KEY

client = genai.Client(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-3-flash-preview"

_MAX_RETRIES = 4
_BACKOFF_BASE = 2  # seconds: 2, 4, 8, 16

# Gemini 3 "thinking" tokens are billed as output and add major latency.
# LOW keeps enough reasoning for layout structure while staying fast.
DEFAULT_CONFIG = types.GenerateContentConfig(
    thinking_config=types.ThinkingConfig(thinking_level="LOW"),
    response_mime_type="application/json",
    max_output_tokens=16384,
)


_RETRYABLE_CODES = {429, 503}
_MAX_WAIT = 30  # seconds — cap server-suggested retry delays


def _retry_delay_seconds(details) -> float | None:
    """Extract google.rpc.RetryInfo's retryDelay (e.g. "33s") from the error details, if present."""
    match = re.search(r'"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"', json.dumps(details))
    return float(match.group(1)) if match else None


def _is_daily_quota_exhausted(details) -> bool:
    """RPD/free-tier daily quota errors won't recover within a request — don't waste time retrying."""
    return "PerDay" in json.dumps(details)


def generate_with_retry(input_content, config: types.GenerateContentConfig = None, **kwargs):
    """Wraps client.models.generate_content with backoff on 429/503 errors."""
    for attempt in range(_MAX_RETRIES):
        try:
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=input_content,
                config=config or DEFAULT_CONFIG,
                **kwargs,
            )
        except (ClientError, ServerError) as e:
            if e.code not in _RETRYABLE_CODES or attempt == _MAX_RETRIES - 1:
                raise
            if e.code == 429 and _is_daily_quota_exhausted(e.details):
                print("🚫 Günlük kota doldu — yeniden deneme yapılmıyor")
                raise
            wait = min(_retry_delay_seconds(e.details) or _BACKOFF_BASE ** (attempt + 1), _MAX_WAIT)
            print(f"⏳ {e.code} — {wait}s bekleyip tekrar deneniyor ({attempt + 1}/{_MAX_RETRIES - 1})…")
            time.sleep(wait)
