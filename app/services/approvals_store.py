"""Persist pending_publishes — PostgreSQL when DATABASE_URL is set, JSON fallback otherwise."""

import json
import os
import psycopg2
import psycopg2.extras
from app.config import PROJECTS_DIR

DATABASE_URL = os.environ.get("DATABASE_URL")
APPROVALS_FILE = os.path.join(PROJECTS_DIR, "_approvals.json")


# ── PostgreSQL helpers ────────────────────────────────────────────────────────

def _get_conn():
    url = DATABASE_URL
    # Render provides "postgres://" but psycopg2 needs "postgresql://"
    if url and url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return psycopg2.connect(url)


def init_db() -> None:
    """Create the approvals table if it doesn't exist. Called once on startup."""
    if not DATABASE_URL:
        return
    with _get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS approvals (
                    id          TEXT PRIMARY KEY,
                    data        JSONB NOT NULL
                )
            """)
        conn.commit()
    print("✅ DB: approvals tablosu hazır")


# ── Public API (same interface as before) ─────────────────────────────────────

def load() -> list[dict]:
    if DATABASE_URL:
        return _db_load()
    return _file_load()


def save(pending_publishes: list[dict]) -> None:
    if DATABASE_URL:
        _db_save(pending_publishes)
    else:
        _file_save(pending_publishes)


# ── PostgreSQL implementation ─────────────────────────────────────────────────

def _db_load() -> list[dict]:
    try:
        with _get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("SELECT data FROM approvals ORDER BY (data->>'submitted_at') ASC")
                return [dict(row["data"]) for row in cur.fetchall()]
    except Exception as e:
        print(f"⚠️  DB load hatası: {e}")
        return []


def _db_save(items: list[dict]) -> None:
    """Upsert all items; remove rows that no longer exist in the list."""
    try:
        with _get_conn() as conn:
            with conn.cursor() as cur:
                ids = [item["id"] for item in items]
                # Upsert each item
                for item in items:
                    cur.execute(
                        """
                        INSERT INTO approvals (id, data) VALUES (%s, %s)
                        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
                        """,
                        (item["id"], json.dumps(item, ensure_ascii=False)),
                    )
                # Delete removed items
                if ids:
                    cur.execute(
                        "DELETE FROM approvals WHERE id != ALL(%s)", (ids,)
                    )
                else:
                    cur.execute("DELETE FROM approvals")
            conn.commit()
    except Exception as e:
        print(f"⚠️  DB save hatası: {e}")


# ── JSON file fallback ────────────────────────────────────────────────────────

def _file_load() -> list[dict]:
    try:
        with open(APPROVALS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _file_save(items: list[dict]) -> None:
    with open(APPROVALS_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
