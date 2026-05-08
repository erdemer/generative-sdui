from fastapi import APIRouter, Form, HTTPException
import app.state as state
from app.services.figma import import_design_system

router = APIRouter(prefix="/api/design-system")


@router.post("/import")
async def import_from_figma(
    figma_url: str = Form(...),
    figma_token: str = Form(...),
):
    try:
        ds = await import_design_system(figma_url, figma_token)
        state.active_design_system = ds
        return {"ok": True, "design_system": ds}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def get_design_system():
    return {"design_system": state.active_design_system}


@router.delete("")
async def clear_design_system():
    state.active_design_system = None
    return {"ok": True}
