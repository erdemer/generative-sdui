import os
import socket
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
CROPS_DIR = os.path.join(STATIC_DIR, "crops")
PROJECTS_DIR = os.path.join(BASE_DIR, "projects")

os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(CROPS_DIR, exist_ok=True)
os.makedirs(PROJECTS_DIR, exist_ok=True)


def _local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


RENDER_URL = os.environ.get("RENDER_EXTERNAL_URL")
if RENDER_URL:
    BASE_URL = RENDER_URL
    print(f"☁️  BULUT MODU (Render): {BASE_URL}")
else:
    BASE_URL = f"http://{_local_ip()}:8000"
    print(f"🏠  YEREL MOD (Local): {BASE_URL}")

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
