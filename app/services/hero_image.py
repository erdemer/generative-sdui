"""Vodafone brand-compliant hero image generation.

Priority order:
  1. Hugging Face FLUX.1-schnell  (free tier, needs HF_TOKEN in .env)
  2. Pollinations.ai               (completely free, no key)
  3. Gemini image models           (paid, fallback of last resort)
"""

import base64
import hashlib
import os
import time
import urllib.parse
import urllib.request

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from app.config import GOOGLE_API_KEY, HF_TOKEN, STATIC_DIR

genai.configure(api_key=GOOGLE_API_KEY)

GENERATED_DIR = os.path.join(STATIC_DIR, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

# ── Brand prompt ─────────────────────────────────────────────────────────────
# NOTE: Avoid "5G network / futuristic city / space" keywords — they trigger
# dark space/earth imagery on every model. Use abstract design language instead.

_HF_PROMPT = (
    "A professional telecom brand hero banner. "
    "Bold vibrant red gradient background, deep red #E60000 to #CC0000. "
    "Elegant white abstract wave lines and circular rings overlaid on the red surface. "
    "Clean modern graphic design, high contrast, bright and energetic. "
    "Commercial advertising aesthetic, no text, no dark areas, no space, no earth, no night sky. "
    "Wide landscape banner format, studio quality."
)

_POLLINATIONS_PROMPT = (
    "vodafone_red_brand_banner,"
    "bold_red_gradient_background,"
    "white_abstract_wave_lines,"
    "clean_modern_graphic_design,"
    "bright_vibrant_commercial,"
    "no_space_no_dark_no_earth,"
    "wide_landscape_telecom_ad"
)

_GEMINI_PROMPT = (
    "Create a professional hero banner image. "
    "Bright vivid red gradient background from #E60000 to #CC0000. "
    "White abstract speed lines and geometric wave patterns. "
    "Clean modern telecom brand aesthetic, bright, NO dark backgrounds, NO space, NO night sky."
)

_GEMINI_MODELS = [
    "gemini-3.1-flash-image",
    "gemini-3-pro-image",
    "gemini-2.5-flash-image",
]

HF_MODEL = "black-forest-labs/FLUX.1-schnell"
HF_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"


# ── Individual generators ─────────────────────────────────────────────────────

def _generate_hf(filepath: str) -> bool:
    """Try Hugging Face FLUX.1-schnell. Returns True on success."""
    if not HF_TOKEN:
        return False
    try:
        import json
        payload = json.dumps({"inputs": _HF_PROMPT, "parameters": {"width": 832, "height": 480}}).encode()
        req = urllib.request.Request(
            HF_URL,
            data=payload,
            headers={
                "Authorization": f"Bearer {HF_TOKEN}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            content_type = resp.headers.get("Content-Type", "")
            if "image" in content_type:
                with open(filepath, "wb") as f:
                    f.write(resp.read())
                print(f"✅ Hero image via Hugging Face FLUX.1: {filepath}")
                return True
            # HF sometimes returns JSON error even with 200
            body = resp.read()
            print(f"⚠️  HF returned non-image: {body[:200]}")
            return False
    except Exception as e:
        print(f"⚠️  Hugging Face failed: {e}")
        return False


def _generate_pollinations(filepath: str) -> bool:
    """Try Pollinations.ai (no key required). Returns True on success."""
    try:
        encoded = urllib.parse.quote(_POLLINATIONS_PROMPT)
        url = (
            f"https://image.pollinations.ai/prompt/{encoded}"
            "?nologo=true&width=832&height=480&model=flux&enhance=true&seed=42"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "SDUI-Studio/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            content_type = resp.headers.get("Content-Type", "")
            if "image" in content_type:
                with open(filepath, "wb") as f:
                    f.write(resp.read())
                print(f"✅ Hero image via Pollinations: {filepath}")
                return True
        return False
    except Exception as e:
        print(f"⚠️  Pollinations failed: {e}")
        return False


def _generate_gemini(filepath: str) -> bool:
    """Try Gemini image models (paid). Returns True on success."""
    for model_name in _GEMINI_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(_GEMINI_PROMPT)
            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data:
                    raw = part.inline_data.data
                    image_bytes = raw if isinstance(raw, (bytes, bytearray)) else base64.b64decode(raw)
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)
                    print(f"✅ Hero image via {model_name}: {filepath}")
                    return True
        except ResourceExhausted:
            print(f"⚠️  {model_name} quota exceeded")
            time.sleep(1)
        except Exception as e:
            print(f"⚠️  {model_name} failed: {e}")
    return False


# ── Public API ────────────────────────────────────────────────────────────────

def generate_brand_hero_image(concept: str = "") -> dict:
    """
    Generate a Vodafone-branded hero image, trying providers in order:
      HF FLUX.1 → Pollinations → Gemini (paid)

    Returns:
        {"url": "/static/generated/hero_xxx.jpg", "provider": "hf|pollinations|gemini", "cached": bool}
    Raises:
        RuntimeError if all providers fail.
    """
    # Cache key based on a stable string (concept ignored for caching — same brand always)
    cache_key = hashlib.md5(b"vodafone-hero-v3").hexdigest()[:16]
    filename = f"hero_{cache_key}.jpg"
    filepath = os.path.join(GENERATED_DIR, filename)
    url = f"/static/generated/{filename}"

    if os.path.exists(filepath):
        return {"url": url, "provider": "cached", "cached": True}

    # 1️⃣  Hugging Face (free with token)
    if _generate_hf(filepath):
        return {"url": url, "provider": "huggingface", "cached": False}

    # 2️⃣  Pollinations (completely free)
    if _generate_pollinations(filepath):
        return {"url": url, "provider": "pollinations", "cached": False}

    # 3️⃣  Gemini image models (paid)
    if _generate_gemini(filepath):
        return {"url": url, "provider": "gemini", "cached": False}

    raise RuntimeError(
        "All image generation providers failed. "
        "Add HF_TOKEN=hf_xxx to .env for free Hugging Face access (hf.co/settings/tokens)."
    )
