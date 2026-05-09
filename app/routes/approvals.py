"""Admin approval workflow for layout publishes from non-admin users."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Body, HTTPException, Header

import app.state as state
from app.routes.auth import get_session

router = APIRouter(prefix="/api/approvals")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _find(request_id: str) -> dict | None:
    return next((p for p in state.pending_publishes if p["id"] == request_id), None)


@router.get("/list")
async def list_requests(
    status_filter: str = "all",
    authorization: str | None = Header(None),
):
    """Admins see everything; users see only their own submissions."""
    sess = get_session(authorization)
    if not sess:
        raise HTTPException(status_code=401, detail="Not authenticated")

    items = state.pending_publishes
    if sess["role"] != "admin":
        items = [p for p in items if p["user"] == sess["username"]]
    if status_filter != "all":
        items = [p for p in items if p["status"] == status_filter]

    # Strip the heavy `layout` field from list view
    summary = [{k: v for k, v in p.items() if k != "layout"} for p in items]
    return {"items": summary, "total": len(summary)}


@router.get("/{request_id}")
async def get_request(request_id: str, authorization: str | None = Header(None)):
    sess = get_session(authorization)
    if not sess:
        raise HTTPException(status_code=401, detail="Not authenticated")
    item = _find(request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")
    if sess["role"] != "admin" and item["user"] != sess["username"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return item


@router.post("/submit")
async def submit_request(
    layout: dict = Body(...),
    screen_name: str = Body("Untitled"),
    platform: str = Body("mobile"),
    authorization: str | None = Header(None),
):
    """Direct submission to the approval queue (used by frontend explicitly)."""
    sess = get_session(authorization)
    if not sess:
        raise HTTPException(status_code=401, detail="Not authenticated")

    item = {
        "id": uuid.uuid4().hex[:12],
        "user": sess["username"],
        "screen_name": screen_name,
        "platform": platform,
        "layout": layout,
        "submitted_at": _now_iso(),
        "status": "pending",
        "reviewed_by": None,
        "reviewed_at": None,
        "reject_reason": None,
    }
    state.pending_publishes.append(item)
    print(f"📝 Onay bekliyor: {sess['username']} → {screen_name} ({platform})")
    return {"status": "pending_approval", "id": item["id"]}


@router.post("/{request_id}/approve")
async def approve_request(
    request_id: str,
    authorization: str | None = Header(None),
):
    sess = get_session(authorization)
    if not sess or sess["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    item = _find(request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")
    if item["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Already {item['status']}")

    full_data = {"screen_name": item["screen_name"], "layout": item["layout"]}
    if item["platform"] == "web":
        state.current_layout_web = full_data
    else:
        state.current_layout_mobile = full_data
    state.current_layout = full_data

    item["status"] = "approved"
    item["reviewed_by"] = sess["username"]
    item["reviewed_at"] = _now_iso()
    print(f"✅ Onaylandı: {request_id} ({item['user']} → {sess['username']})")
    return {"status": "success", "id": request_id}


@router.post("/{request_id}/reject")
async def reject_request(
    request_id: str,
    reason: str = Body("", embed=True),
    authorization: str | None = Header(None),
):
    sess = get_session(authorization)
    if not sess or sess["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    item = _find(request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")
    if item["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Already {item['status']}")

    item["status"] = "rejected"
    item["reviewed_by"] = sess["username"]
    item["reviewed_at"] = _now_iso()
    item["reject_reason"] = reason
    print(f"❌ Reddedildi: {request_id} ({sess['username']})")
    return {"status": "success", "id": request_id}
