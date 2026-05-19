"""Brand rules endpoint — GET/PUT the free-text brand guidelines."""

from fastapi import APIRouter, Body

import app.state as state
from app.services import brand_store
from app.services.brand_store import DEFAULT_BRAND_RULES

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
