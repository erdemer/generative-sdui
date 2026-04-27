import os
import json
import shutil
from fastapi import APIRouter, Body, HTTPException

from app.config import PROJECTS_DIR

router = APIRouter(prefix="/api/fs")


def _safe_path(rel: str) -> str:
    """Resolve a relative path inside PROJECTS_DIR, reject path traversal."""
    full = os.path.normpath(os.path.join(PROJECTS_DIR, rel))
    if not full.startswith(os.path.normpath(PROJECTS_DIR)):
        raise HTTPException(status_code=400, detail="Invalid path")
    return full


@router.get("/tree")
async def get_fs_tree():
    def _walk(path):
        items = []
        for name in sorted(os.listdir(path)):
            if name.startswith("."):
                continue
            full = os.path.join(path, name)
            rel = os.path.relpath(full, PROJECTS_DIR)
            node = {"name": name, "path": rel, "is_dir": os.path.isdir(full)}
            if node["is_dir"]:
                node["children"] = _walk(full)
            items.append(node)
        return items

    return {"status": "success", "tree": _walk(PROJECTS_DIR)}


@router.post("/folder")
async def create_folder(path: str):
    os.makedirs(_safe_path(path), exist_ok=True)
    return {"status": "success"}


@router.post("/file")
async def create_file(path: str):
    full = _safe_path(path if path.endswith(".json") else path + ".json")
    if not os.path.exists(full):
        with open(full, "w", encoding="utf-8") as f:
            json.dump({
                "screen_name": os.path.basename(full).replace(".json", ""),
                "layout": {
                    "type": "Column",
                    "props": {"fillMaxSize": "true", "backgroundColor": "#FFFFFF"},
                    "children": [],
                },
            }, f)
    return {"status": "success"}


@router.get("/file")
async def get_file(path: str):
    full = _safe_path(path)
    if not os.path.exists(full):
        raise HTTPException(status_code=404, detail="File not found")
    with open(full, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


@router.put("/file")
async def update_file(path: str, data: dict = Body(...)):
    full = _safe_path(path)
    with open(full, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return {"status": "success"}


@router.delete("/item")
async def delete_item(path: str):
    full = _safe_path(path)
    if os.path.exists(full):
        shutil.rmtree(full) if os.path.isdir(full) else os.remove(full)
    return {"status": "success"}


@router.put("/move")
async def move_item(source_path: str, target_path: str):
    src = _safe_path(source_path)
    dst_dir = _safe_path(target_path) if target_path else PROJECTS_DIR
    if not os.path.exists(src):
        raise HTTPException(status_code=404, detail="Source not found")
    if os.path.isdir(src) and dst_dir.startswith(src):
        raise HTTPException(status_code=400, detail="Cannot move directory into itself")
    shutil.move(src, os.path.join(dst_dir, os.path.basename(src)))
    return {"status": "success"}
