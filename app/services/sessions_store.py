"""Persist sessions to disk so they survive server restarts."""

import json
import os
from app.config import PROJECTS_DIR

SESSIONS_FILE = os.path.join(PROJECTS_DIR, "_sessions.json")


def load() -> dict:
    try:
        with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save(sessions: dict) -> None:
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)
