import os
import sys
import shutil
from pathlib import Path

# Add backend directory to sys.path so app modules can be imported
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Handle Vercel serverless read-only filesystem
# Copy SQLite database into writable /tmp if running on Vercel
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    tmp_db = "/tmp/polarise_telecom.db"
    if not os.path.exists(tmp_db):
        for candidate in [
            BACKEND_DIR / "polarise_telecom.db",
            ROOT_DIR / "polarise_telecom.db",
            Path("./backend/polarise_telecom.db"),
            Path("./polarise_telecom.db"),
        ]:
            if candidate.exists():
                try:
                    shutil.copy2(str(candidate), tmp_db)
                    break
                except Exception:
                    pass

from app.main import app as fastapi_app

# ASGI wrapper to ensure clean routing whether Vercel strips /api prefix or retains it
async def app(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        # If incoming path does not have /api prefix, ensure FastAPI can match it
        if not path.startswith("/api"):
            # Check if FastAPI has the raw route; if not, prepend /api
            routes = [route.path for route in fastapi_app.routes]
            if path not in routes:
                scope["path"] = "/api" + (path if path.startswith("/") else f"/{path}")
    await fastapi_app(scope, receive, send)
