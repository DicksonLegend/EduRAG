from __future__ import annotations

"""
Application configuration using Pydantic Settings.
Loads values from environment variables / .env file.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# ── Force all model downloads into the project's models/ folder ──
# This prevents HuggingFace from using C: drive cache
os.environ["HF_HOME"] = str(MODELS_DIR / "huggingface")
os.environ["TRANSFORMERS_CACHE"] = str(MODELS_DIR / "huggingface")
os.environ["SENTENCE_TRANSFORMERS_HOME"] = str(MODELS_DIR / "sentence-transformers")


class Settings(BaseSettings):
    """Central configuration for the EduRAG application."""

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "EduRAG"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default=f"sqlite:///{BASE_DIR / 'edurag.db'}",
        description="SQLAlchemy database URL. Use SQLite for dev, PostgreSQL for prod.",
    )

    # ── JWT / Auth ───────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-in-production-use-a-strong-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── File Upload ──────────────────────────────────────────────
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_FILE_SIZE_MB: int = 100  # Maximum PDF file size in MB
    ALLOWED_EXTENSIONS: list[str] = [".pdf"]

    # ── Models Directory ──────────────────────────────────────────
    MODELS_DIR: Path = MODELS_DIR

    # ── Embedding Model ──────────────────────────────────────────
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-base-en-v1.5"
    EMBEDDING_DIMENSION: int = 768
    EMBEDDING_BATCH_SIZE: int = 32

    # ── LLM (Mistral-7B via llama.cpp) ───────────────────────────
    LLM_MODEL_REPO: str = "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"
    LLM_MODEL_FILENAME: str = "mistral-7b-instruct-v0.2.Q4_K_M.gguf"
    LLM_MODEL_PATH: str = Field(
        default=str(MODELS_DIR / "mistral-7b-instruct-v0.2.Q4_K_M.gguf"),
        description="Path to the quantized GGUF model file. Auto-downloaded if missing.",
    )
    LLM_CONTEXT_LENGTH: int = 4096
    LLM_MAX_TOKENS: int = 1024
    LLM_TEMPERATURE: float = 0.3
    LLM_TOP_P: float = 0.9
    LLM_GPU_LAYERS: int = 33  # Number of layers to offload to GPU
    LLM_THREADS: int = 4

    # ── FAISS ────────────────────────────────────────────────────
    FAISS_INDEX_DIR: Path = BASE_DIR / "faiss_indices"
    FAISS_TOP_K: int = 5

    # ── Chunking ─────────────────────────────────────────────────
    CHUNK_MIN_WORDS: int = 400
    CHUNK_MAX_WORDS: int = 600
    CHUNK_OVERLAP_WORDS: int = 100

    # ── OCR ──────────────────────────────────────────────────────
    TESSERACT_CMD: Optional[str] = None  # Path to tesseract binary if not in PATH

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton settings instance
settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
(settings.MODELS_DIR / "huggingface").mkdir(parents=True, exist_ok=True)
(settings.MODELS_DIR / "sentence-transformers").mkdir(parents=True, exist_ok=True)
