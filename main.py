from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import STATIC_DIR
from app.routes import generate, verify, layout, ab_test, filesystem, design_system, auth, approvals
import app.state as state
from app.services import ds_store, approvals_store

app = FastAPI(title="SDUI Studio")

# Load persisted state on startup
state.design_systems = ds_store.load()
approvals_store.init_db()
state.pending_publishes = approvals_store.load()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(approvals.router)
app.include_router(generate.router)
app.include_router(verify.router)
app.include_router(layout.router)
app.include_router(ab_test.router)
app.include_router(filesystem.router)
app.include_router(design_system.router)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def index():
    return FileResponse(f"{STATIC_DIR}/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
