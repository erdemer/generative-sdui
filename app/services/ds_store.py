"""Persist design systems to a JSON file so they survive server restarts."""

import json
import os
from app.config import PROJECTS_DIR

DS_FILE = os.path.join(PROJECTS_DIR, "_design_systems.json")


def load() -> list[dict]:
    try:
        with open(DS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save(design_systems: list[dict]) -> None:
    with open(DS_FILE, "w", encoding="utf-8") as f:
        json.dump(design_systems, f, ensure_ascii=False, indent=2)
