import time
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from app.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel(model_name="gemini-3-flash-preview")

_MAX_RETRIES = 4
_BACKOFF_BASE = 2  # seconds: 2, 4, 8, 16


def generate_with_retry(input_content, **kwargs):
    """Wraps model.generate_content with exponential backoff on 429 errors."""
    for attempt in range(_MAX_RETRIES):
        try:
            return model.generate_content(input_content, **kwargs)
        except ResourceExhausted as e:
            if attempt == _MAX_RETRIES - 1:
                raise
            wait = _BACKOFF_BASE ** (attempt + 1)
            print(f"⏳ Rate limit — {wait}s bekleyip tekrar deneniyor ({attempt + 1}/{_MAX_RETRIES - 1})…")
            time.sleep(wait)
