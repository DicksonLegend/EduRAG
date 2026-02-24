from __future__ import annotations

"""
Embedding service using BAAI/bge-base-en-v1.5 via sentence-transformers.
Singleton pattern ensures the model is loaded only once.
"""

import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

_model = None


def _get_model():
    """Lazy-load the embedding model (singleton). Auto-downloads to project models/ folder."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        from app.config import settings

        cache_dir = str(settings.MODELS_DIR / "sentence-transformers")
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
        logger.info(f"Model cache directory: {cache_dir}")
        logger.info("Downloading model if not cached (first run only)...")

        _model = SentenceTransformer(
            settings.EMBEDDING_MODEL_NAME,
            cache_folder=cache_dir,
        )
        logger.info("Embedding model loaded successfully.")
    return _model


class EmbeddingService:
    """
    Generates embeddings using bge-base-en-v1.5.

    For bge models, queries should be prefixed with
    "Represent this sentence for searching relevant passages: "
    for optimal retrieval performance.
    """

    QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

    def __init__(self):
        self.model = _get_model()
        from app.config import settings
        self.batch_size = settings.EMBEDDING_BATCH_SIZE

    def encode_texts(self, texts: list[str], is_query: bool = False) -> np.ndarray:
        """
        Encode a list of texts into embeddings.

        Args:
            texts: List of text strings.
            is_query: If True, add the bge query prefix for better retrieval.

        Returns:
            Numpy array of shape (len(texts), dimension).
        """
        if is_query:
            texts = [self.QUERY_PREFIX + t for t in texts]

        embeddings = self.model.encode(
            texts,
            batch_size=self.batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,  # L2 normalize for cosine similarity
        )
        return np.array(embeddings, dtype=np.float32)

    def encode_query(self, query: str) -> np.ndarray:
        """Encode a single query string. Returns shape (1, dimension)."""
        return self.encode_texts([query], is_query=True)

    def encode_documents(self, texts: list[str]) -> np.ndarray:
        """Encode document chunks (no query prefix). Returns shape (n, dimension)."""
        return self.encode_texts(texts, is_query=False)


# ── Singleton ────────────────────────────────────────────────────
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get or create the singleton EmbeddingService."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
