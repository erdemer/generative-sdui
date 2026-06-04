import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Header

import app.state as state
from app.routes.auth import get_session
from app.services import approvals_store

router = APIRouter()


@router.post("/update_layout")
async def update_layout(
    layout: dict = Body(...),
    screen_name: str = Body("Untitled"),
    platform: str = Body("mobile"),
    authorization: str | None = Header(None),
):
    sess = get_session(authorization)

    # Authenticated non-admin → goes to approval queue instead of going live.
    if sess and sess["role"] != "admin":
        item = {
            "id": uuid.uuid4().hex[:12],
            "user": sess["username"],
            "screen_name": screen_name,
            "platform": platform,
            "layout": layout,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "status": "pending",
            "reviewed_by": None,
            "reviewed_at": None,
            "reject_reason": None,
        }
        state.pending_publishes.append(item)
        await approvals_store.save_async(state.pending_publishes)
        print(f"📝 Onay bekliyor: {sess['username']} → {screen_name} ({platform})")
        return {"status": "pending_approval", "id": item["id"]}

    # Admin or no session → publish directly (legacy behavior preserved).
    full_data = {"screen_name": screen_name, "layout": layout}
    if platform == "web":
        state.current_layout_web = full_data
    else:
        state.current_layout_mobile = full_data
    state.current_layout = full_data
    who = sess["username"] if sess else "anonymous"
    print(f"✅ Layout güncellendi (platform: {platform}, by: {who})")
    return {"status": "success"}


@router.get("/current-ui")
async def get_current_ui(platform: str = "mobile"):
    candidate = None

    if platform == "web" and state.current_layout_web:
        candidate = state.current_layout_web
    elif platform == "mobile" and state.current_layout_mobile:
        candidate = state.current_layout_mobile

    if not candidate and state.ab_test_active and state.variant_a and state.variant_b and platform != "web":
        chosen = random.choice(["A", "B"])
        candidate = state.variant_a if chosen == "A" else state.variant_b
        print(f"🎲 A/B: Varyant {chosen}")

    if candidate and "screen_name" in candidate and "layout" in candidate:
        return candidate

    return {
        "screen_name": "EmptyState",
        "layout": {
            "type": "Column",
            "props": {
                "fillMaxSize": "true",
                "verticalArrangement": "center",
                "horizontalAlignment": "center",
                "backgroundColor": "#FAFAFA",
            },
            "children": [
                {"type": "Icon", "props": {"name": "palette", "size": 48, "color": "#D1D5DB"}},
                {"type": "Text", "props": {"text": "Henüz Tasarım Yok", "style": "h3", "color": "#9CA3AF", "marginTop": 16, "textAlign": "center"}},
                {"type": "Text", "props": {"text": "Sol menüden bir tasarım üretin.", "style": "body", "color": "#D1D5DB", "marginTop": 8, "textAlign": "center"}},
            ],
        },
    }
