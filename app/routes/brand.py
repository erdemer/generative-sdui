"""Brand rules endpoint — GET/PUT the free-text brand guidelines."""

from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse

import app.state as state
from app.services import brand_store
from app.services.brand_store import DEFAULT_BRAND_RULES
from app.services.hero_image import generate_brand_hero_image

router = APIRouter(prefix="/api/brand")


@router.get("/rules")
async def get_brand_rules():
    return {"rules": state.brand_rules, "default": DEFAULT_BRAND_RULES}


@router.put("/rules")
async def update_brand_rules(rules: str = Body(..., embed=True)):
    state.brand_rules = rules
    brand_store.save(rules)
    return {"status": "ok"}


@router.post("/rules/reset")
async def reset_brand_rules():
    state.brand_rules = DEFAULT_BRAND_RULES
    brand_store.save(DEFAULT_BRAND_RULES)
    return {"rules": DEFAULT_BRAND_RULES}


@router.post("/generate_hero_image")
async def generate_hero_image(concept: str = Body("", embed=True)):
    """Generate a Vodafone brand-compliant hero image using Gemini image generation.
    Returns the static URL to the saved image, ready to be injected into an SDUI prompt."""
    try:
        result = generate_brand_hero_image(concept)
        return {"status": "ok", **result}
    except RuntimeError as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "message": str(e), "url": None},
        )
