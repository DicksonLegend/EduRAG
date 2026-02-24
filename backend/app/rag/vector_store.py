from __future__ import annotations

"""
FAISS vector store wrapper for document embeddings.
Supports per-document index management with persistence.
"""

import logging
from pathlib import Path
from typing import Optional

import faiss
import numpy as np

from app.config import settings

logger = logging.getLogger(__name__)


class VectorStore:
    """
    Manages FAISS indices for document embeddings.

    Uses IndexFlatIP (inner product) with L2-normalized vectors,
    which is equivalent to cosine similarity search.
    """

    def __init__(self, dimension: int = settings.EMBEDDING_DIMENSION):
        self.dimension = dimension
        self._indices: dict[int, faiss.IndexIDMap] = {}  # doc_id -> index

    def _get_index_path(self, document_id: int) -> Path:
        """Get the file path for a document's FAISS index."""
        return settings.FAISS_INDEX_DIR / f"doc_{document_id}.index"

    def create_index(self, document_id: int) -> faiss.IndexIDMap:
        """Create a new empty FAISS index for a document."""
        base_index = faiss.IndexFlatIP(self.dimension)
        index = faiss.IndexIDMap(base_index)
        self._indices[document_id] = index
        logger.info(f"Created new FAISS index for document {document_id}")
        return index

    def add_embeddings(
        self,
        document_id: int,
        embeddings: np.ndarray,
        ids: np.ndarray,
    ):
        """
        Add embeddings to a document's FAISS index.

        Args:
            document_id: ID of the document.
            embeddings: Numpy array of shape (n, dimension), L2-normalized.
            ids: Numpy array of int64 IDs (chunk FAISS IDs).
        """
        if document_id not in self._indices:
            self.create_index(document_id)

        index = self._indices[document_id]

        # Ensure embeddings are float32 and normalized
        embeddings = embeddings.astype(np.float32)
        faiss.normalize_L2(embeddings)

        ids = ids.astype(np.int64)
        index.add_with_ids(embeddings, ids)

        logger.info(
            f"Added {len(ids)} embeddings to document {document_id} index "
            f"(total: {index.ntotal})"
        )

    def search(
        self,
        document_id: int,
        query_embedding: np.ndarray,
        top_k: int = settings.FAISS_TOP_K,
    ) -> list[dict]:
        """
        Search for similar chunks in a document's FAISS index.

        Args:
            document_id: ID of the document to search.
            query_embedding: Query embedding vector, shape (1, dimension).
            top_k: Number of results to return.

        Returns:
            List of dicts: [{"faiss_id": int, "score": float, "confidence": float}]
        """
        if document_id not in self._indices:
            self.load_index(document_id)

        index = self._indices.get(document_id)
        if index is None or index.ntotal == 0:
            logger.warning(f"No index found for document {document_id}")
            return []

        # Normalize query
        query = query_embedding.astype(np.float32).reshape(1, -1)
        faiss.normalize_L2(query)

        # Search
        actual_k = min(top_k, index.ntotal)
        scores, ids = index.search(query, actual_k)

        results = []
        for score, faiss_id in zip(scores[0], ids[0]):
            if faiss_id == -1:
                continue
            results.append({
                "faiss_id": int(faiss_id),
                "score": float(score),
                "confidence": self._score_to_confidence(float(score)),
            })

        return results

    def search_multiple_documents(
        self,
        document_ids: list[int],
        query_embedding: np.ndarray,
        top_k: int = settings.FAISS_TOP_K,
    ) -> list[dict]:
        """Search across multiple document indices and merge results."""
        all_results = []
        for doc_id in document_ids:
            results = self.search(doc_id, query_embedding, top_k)
            for r in results:
                r["document_id"] = doc_id
            all_results.extend(results)

        # Sort by score descending and take top_k
        all_results.sort(key=lambda x: x["score"], reverse=True)
        return all_results[:top_k]

    def save_index(self, document_id: int):
        """Persist a document's FAISS index to disk."""
        index = self._indices.get(document_id)
        if index is None:
            logger.warning(f"No index to save for document {document_id}")
            return

        path = self._get_index_path(document_id)
        faiss.write_index(index, str(path))
        logger.info(f"Saved FAISS index for document {document_id} to {path}")

    def load_index(self, document_id: int) -> Optional[faiss.IndexIDMap]:
        """Load a document's FAISS index from disk."""
        path = self._get_index_path(document_id)
        if not path.exists():
            logger.warning(f"No saved index found for document {document_id}")
            return None

        index = faiss.read_index(str(path))
        self._indices[document_id] = index
        logger.info(
            f"Loaded FAISS index for document {document_id} "
            f"({index.ntotal} vectors)"
        )
        return index

    def delete_index(self, document_id: int):
        """Remove a document's FAISS index from memory and disk."""
        self._indices.pop(document_id, None)
        path = self._get_index_path(document_id)
        if path.exists():
            path.unlink()
            logger.info(f"Deleted FAISS index for document {document_id}")

    @staticmethod
    def _score_to_confidence(score: float) -> float:
        """
        Convert FAISS inner-product score to a confidence percentage.
        Scores range from -1 to 1 for normalized vectors (cosine similarity).
        """
        # Clamp to [0, 1] range and convert to percentage
        confidence = max(0.0, min(1.0, (score + 1) / 2)) * 100
        return round(confidence, 2)


# ── Singleton ────────────────────────────────────────────────────
vector_store = VectorStore()
