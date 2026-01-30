from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db

# Import chat router (required)
from app.router import chat

# Try importing tasks router (optional / Phase-2-3 compatible)
try:
    from app.router import tasks
    TASKS_AVAILABLE = True
except ImportError:
    TASKS_AVAILABLE = False


app = FastAPI(title="Todo Backend")


# -------------------------
# Startup: init DB tables
# -------------------------
@app.on_event("startup")
def on_startup():
    init_db()


# -------------------------
# CORS (dev / minikube safe)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Routes
# -------------------------
if TASKS_AVAILABLE:
    app.include_router(tasks.router, prefix="/api")

app.include_router(chat.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
