import uuid
from fastapi import APIRouter, Form, HTTPException

import app.state as state
from app.services.figma import import_design_system
from app.services import ds_store

router = APIRouter(prefix="/api/design-system")


def _persist():
    ds_store.save(state.design_systems)


@router.post("/import")
async def import_from_figma(
    figma_url: str = Form(...),
    figma_token: str = Form(...),
    name: str = Form(""),
):
    try:
        ds = await import_design_system(figma_url, figma_token)
        entry = {
            "id": str(uuid.uuid4()),
            "name": name.strip() or ds.get("file_key", "Design System"),
            "active": True,
            **ds,
        }
        state.design_systems.append(entry)
        _persist()
        return {"ok": True, "design_system": entry, "all": state.design_systems}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/list")
async def list_design_systems():
    return {"design_systems": state.design_systems}


@router.put("/{ds_id}/toggle")
async def toggle_active(ds_id: str):
    for ds in state.design_systems:
        if ds["id"] == ds_id:
            ds["active"] = not ds.get("active", True)
            _persist()
            return {"ok": True, "active": ds["active"], "all": state.design_systems}
    raise HTTPException(status_code=404, detail="Design system not found")


@router.put("/{ds_id}/rename")
async def rename(ds_id: str, name: str = Form(...)):
    for ds in state.design_systems:
        if ds["id"] == ds_id:
            ds["name"] = name.strip()
            _persist()
            return {"ok": True, "all": state.design_systems}
    raise HTTPException(status_code=404, detail="Design system not found")


@router.delete("/{ds_id}")
async def delete_design_system(ds_id: str):
    before = len(state.design_systems)
    state.design_systems = [d for d in state.design_systems if d["id"] != ds_id]
    if len(state.design_systems) == before:
        raise HTTPException(status_code=404, detail="Design system not found")
    _persist()
    return {"ok": True, "all": state.design_systems}


# Legacy single-DS compat endpoints (used by old frontend code)
@router.get("")
async def get_active():
    active = [d for d in state.design_systems if d.get("active")]
    return {"design_system": active[0] if active else None}


@router.delete("")
async def clear_all():
    state.design_systems = []
    _persist()
    return {"ok": True}
