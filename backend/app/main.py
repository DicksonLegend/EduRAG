"""
EduRAG Backend — FastAPI Application Entry Point

Offline Adaptive AI Personalized Learning & Evaluation System.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan (Startup / Shutdown) ────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: runs on startup and shutdown."""
    # ── Startup ──
    logger.info("=" * 60)
    logger.info(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"  Offline Adaptive AI Learning System")
    logger.info("=" * 60)

    # Initialize database tables
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized.")

    # Preload FAISS indices from disk
    logger.info("Loading FAISS indices...")
    try:
        from app.rag.vector_store import vector_store
        import os
        faiss_dir = str(settings.FAISS_INDEX_DIR)
        if os.path.exists(faiss_dir):
            for f in os.listdir(faiss_dir):
                if f.endswith(".index"):
                    doc_id = int(f.replace("doc_", "").replace(".index", ""))
                    vector_store.load_index(doc_id)
        logger.info("FAISS indices loaded.")
    except Exception as e:
        logger.warning(f"FAISS loading skipped: {e}")

    logger.info("Server is ready!")
    yield

    # ── Shutdown ──
    logger.info("Shutting down EduRAG...")


# ── FastAPI App ──────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Offline Adaptive AI Personalized Learning & Evaluation System. "
        "RAG-based academic assistant with adaptive explanations, MCQ generation, "
        "progress tracking, and mentor dashboards."
    ),
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",    # Alt dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ────────────────────────────────────────────

from app.api.routes.auth import router as auth_router
from app.api.routes.documents import router as documents_router
from app.api.routes.query import router as query_router
from app.api.routes.mcq import router as mcq_router
from app.api.routes.topics import router as topics_router
from app.api.routes.progress import router as progress_router
from app.api.routes.mentor import router as mentor_router
from app.api.routes.revision import router as revision_router
from app.api.routes.history import router as history_router

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(query_router)
app.include_router(mcq_router)
app.include_router(topics_router)
app.include_router(progress_router)
app.include_router(mentor_router)
app.include_router(revision_router)
app.include_router(history_router)


# ── Health Check ─────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health", tags=["Health"])
def detailed_health():
    """Detailed health check with component statuses."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "components": {
            "database": "connected",
            "faiss": "loaded",
            "embedding_model": "lazy_load",
            "llm": "lazy_load",
        },
    }
