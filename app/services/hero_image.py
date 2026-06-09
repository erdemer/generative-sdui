"""Vodafone brand-compliant hero image generation using Gemini image models."""

import base64
import hashlib
import os
import time

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from app.config import GOOGLE_API_KEY, STATIC_DIR

genai.configure(api_key=GOOGLE_API_KEY)

GENERATED_DIR = os.path.join(STATIC_DIR, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

# Ordered list of image-capable models to try
_IMAGE_MODELS = [
    "gemini-3.1-flash-image",
    "gemini-3-pro-image",
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image-preview",
]

_BRAND_SYSTEM_PROMPT = """\
You are a professional visual designer for Vodafone Turkey.
Create a hero banner image that strictly follows Vodafone brand guidelines:
- Dominant color: Vodafone Red (#E60000)
- Background: Bold red gradient (#E60000 → #CC0000) — NO dark backgrounds, NO black, NO space/night imagery
- Style: Modern, premium, energetic, clean
- Decorative elements: Abstract 5G signal waves, speed lines, geometric shapes in white/light pink
- Composition: Wide banner (16:9), bright, vibrant, professional telecom campaign aesthetic
- White highlights and accents to contrast the red background
"""


def _build_prompt(concept: str) -> str:
    base = (
        "Create a professional Vodafone 5G hero banner image. "
        "Bright red gradient background (#E60000 to #CC0000). "
        "Abstract white speed lines and 5G network wave patterns overlaid on the red background. "
        "Clean modern telecom brand aesthetic. High-key lighting. Vivid colors. "
        "NO dark backgrounds. NO space. NO night sky. NO earth from space imagery. "
        "Purely abstract graphic design with Vodafone red as the hero color."
    )
    if concept and concept.strip():
        base += f" Additional concept: {concept.strip()}"
    return base


def generate_brand_hero_image(concept: str = "") -> dict:
    """
    Generate a Vodafone-branded hero image using Gemini image generation.

    Returns:
        {"url": "/static/generated/hero_xxx.jpg", "model": "...", "cached": bool}
    Raises:
        RuntimeError: if all models fail
    """
    prompt = _build_prompt(concept)

    # Cache based on prompt hash so repeated calls don't regenerate
    cache_key = hashlib.md5(prompt.encode()).hexdigest()[:16]
    filename = f"hero_{cache_key}.jpg"
    filepath = os.path.join(GENERATED_DIR, filename)
    url = f"/static/generated/{filename}"

    if os.path.exists(filepath):
        return {"url": url, "model": "cached", "cached": True}

    last_error = None
    for model_name in _IMAGE_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)

            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data:
                    raw = part.inline_data.data
                    # data may already be bytes or base64 string
                    if isinstance(raw, (bytes, bytearray)):
                        image_bytes = raw
                    else:
                        image_bytes = base64.b64decode(raw)

                    with open(filepath, "wb") as f:
                        f.write(image_bytes)

                    print(f"✅ Hero image generated with {model_name}: {url}")
                    return {"url": url, "model": model_name, "cached": False}

            raise ValueError("No image part in response")

        except ResourceExhausted as e:
            print(f"⚠️  {model_name} quota exceeded, trying next model…")
            last_error = e
            time.sleep(1)
        except Exception as e:
            print(f"⚠️  {model_name} failed: {e}")
            last_error = e

    raise RuntimeError(
        f"All Gemini image models failed. Last error: {last_error}. "
        "Please enable billing on your Google AI API key for image generation models."
    )
