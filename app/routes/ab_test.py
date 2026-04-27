from fastapi import APIRouter, Body

import app.state as state

router = APIRouter()


@router.post("/publish_ab")
async def publish_ab(data: dict = Body(...)):
    state.variant_a = data.get("layout_a")
    state.variant_b = data.get("layout_b")
    state.ab_test_active = True
    print("🚀 A/B testi başlatıldı")
    return {"status": "success"}
