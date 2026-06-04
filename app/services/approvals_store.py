"""Persist pending_publishes — PostgreSQL when DATABASE_URL is set, JSON fallback otherwise."""

import json
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import psycopg2
import psycopg2.extras
import psycopg2.pool
from app.config import PROJECTS_DIR

DATABASE_URL = os.environ.get("DATABASE_URL")
APPROVALS_FILE = os.path.join(PROJECTS_DIR, "_approvals.json")

# ── Connection pool (reuse connections instead of reconnecting each call) ──────
_pool: psycopg2.pool.ThreadedConnectionPool | None = None
_executor = ThreadPoolExecutor(max_workers=4)


def _get_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _pool
    if _pool is None or _pool.closed:
        url = DATABASE_URL
        if url and url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        _pool = psycopg2.pool.ThreadedConnectionPool(minconn=1, maxconn=4, dsn=url)
    return _pool


def _get_conn():
    """Get a connection from the pool (or create a direct one if pool fails)."""
    try:
        return _get_pool().getconn()
    except Exception:
        url = DATABASE_URL
        if url and url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        return psycopg2.connect(url)


def _release_conn(conn):
    """Return connection to pool."""
    try:
        pool = _get_pool()
        pool.putconn(conn)
    except Exception:
        try:
            conn.close()
        except Exception:
            pass


# ── Init ──────────────────────────────────────────────────────────────────────

def init_db() -> None:
    """Create the approvals table if it doesn't exist. Called once on startup."""
    if not DATABASE_URL:
        return
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS approvals (
                    id          TEXT PRIMARY KEY,
                    data        JSONB NOT NULL
                )
            """)
        conn.commit()
        print("✅ DB: approvals tablosu hazır")
    finally:
        _release_conn(conn)


# ── Public API ────────────────────────────────────────────────────────────────

def load() -> list[dict]:
    if DATABASE_URL:
        return _db_load()
    return _file_load()


def save(pending_publishes: list[dict]) -> None:
    if DATABASE_URL:
        _db_save(pending_publishes)
    else:
        _file_save(pending_publishes)


async def save_async(pending_publishes: list[dict]) -> None:
    """Non-blocking version — runs save() in a thread so the event loop isn't blocked."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, save, pending_publishes)


# ── PostgreSQL implementation ─────────────────────────────────────────────────

def _db_load() -> list[dict]:
    conn = _get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT data FROM approvals ORDER BY (data->>'submitted_at') ASC")
            return [dict(row["data"]) for row in cur.fetchall()]
    except Exception as e:
        print(f"⚠️  DB load hatası: {e}")
        return []
    finally:
        _release_conn(conn)


def _db_save(items: list[dict]) -> None:
    """Upsert all items; remove rows that no longer exist in the list."""
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            ids = [item["id"] for item in items]
            for item in items:
                cur.execute(
                    """
                    INSERT INTO approvals (id, data) VALUES (%s, %s)
                    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
                    """,
                    (item["id"], json.dumps(item, ensure_ascii=False)),
                )
            if ids:
                cur.execute(
                    "DELETE FROM approvals WHERE id != ALL(%s)", (ids,)
                )
            else:
                cur.execute("DELETE FROM approvals")
        conn.commit()
    except Exception as e:
        print(f"⚠️  DB save hatası: {e}")
        try:
            conn.rollback()
        except Exception:
            pass
    finally:
        _release_conn(conn)


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
