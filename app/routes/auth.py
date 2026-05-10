"""Simple session-based auth with two roles: admin and user."""
import uuid
from fastapi import APIRouter, Body, HTTPException, Header

import app.state as state
from app.services import sessions_store

router = APIRouter(prefix="/api/auth")

# Built-in admin credentials (demo). Any other username/password = normal user.
ADMIN_CREDENTIALS = {
    "admin": "admin123",
}


def get_session(authorization: str | None) -> dict | None:
    """Extract session dict from Authorization header (Bearer <token>)."""
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    return state.sessions.get(token)


@router.post("/login")
async def login(
    username: str = Body(...),
    password: str = Body(...),
):
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    if ADMIN_CREDENTIALS.get(username) == password:
        role = "admin"
    elif username in ADMIN_CREDENTIALS:
        # Wrong password for a known admin user
        raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        role = "user"

    token = uuid.uuid4().hex
    state.sessions[token] = {"username": username, "role": role}
    sessions_store.save(state.sessions)
    print(f"🔑 Login: {username} as {role}")
    return {"token": token, "username": username, "role": role}


@router.get("/me")
async def me(authorization: str | None = Header(None)):
    sess = get_session(authorization)
    if not sess:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return sess


@router.post("/logout")
async def logout(authorization: str | None = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        state.sessions.pop(token, None)
        sessions_store.save(state.sessions)
    return {"status": "success"}
