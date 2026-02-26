"""
Retrieval service — handles FAISS similarity search and chunk retrieval.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.services.embedding_service import get_embedding_service
from app.rag.vector_store import vector_store
from app.db.repositories.document_repo import DocumentRepository

logger = logging.getLogger(__name__)


class RetrievalService:
    """
    Handles the retrieval step of the RAG pipeline:
    1. Encode the query
    2. Search FAISS index
    3. Fetch chunk texts from database
    """

    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.embedding_service = get_embedding_service()

    def retrieve(
        self,
        query: str,
        document_id: int,
        top_k: int = 5,
        topic_filter: Optional[str] = None,
    ) -> list[dict]:
        """
        Retrieve the most relevant chunks for a query from a single document.

        Args:
            query: User's question.
            document_id: ID of the document to search.
            top_k: Number of chunks to retrieve.
            topic_filter: Optional topic to restrict search.

        Returns:
            List of dicts with keys: text, page_number, topic, score, confidence.
        """
        # Sanitize topic filter — ignore Swagger placeholder values
        if topic_filter and topic_filter.strip().lower() in ("", "string", "null", "none"):
            topic_filter = None

        # Step 1: Encode query
        query_embedding = self.embedding_service.encode_query(query)

        # Step 2: FAISS search
        search_results = vector_store.search(document_id, query_embedding, top_k=top_k * 2)

        if not search_results:
            logger.warning(f"No FAISS results for document {document_id}")
            return []

        # Step 3: Fetch chunk data from database
        faiss_ids = [r["faiss_id"] for r in search_results]
        chunks = self.doc_repo.get_chunks_by_faiss_ids(faiss_ids)

        # Build a lookup map
        chunk_map = {c.faiss_id: c for c in chunks}

        # Step 4: Assemble results with scores
        results = []
        for sr in search_results:
            chunk = chunk_map.get(sr["faiss_id"])
            if chunk is None:
                continue

            # Apply topic filter if specified
            if topic_filter and chunk.topic != topic_filter:
                continue

            results.append({
                "text": chunk.text,
                "page_number": chunk.page_number,
                "topic": chunk.topic,
                "chunk_index": chunk.chunk_index,
                "score": sr["score"],
                "confidence": sr["confidence"],
                "faiss_id": sr["faiss_id"],
            })

        # Limit to top_k after filtering
        results = results[:top_k]

        logger.info(
            f"Retrieved {len(results)} chunks for query "
            f"(doc={document_id}, topic={topic_filter})"
        )
        return results

    def retrieve_multi(
        self,
        query: str,
        document_ids: list[int],
        top_k: int = 5,
        topic_filter: Optional[str] = None,
    ) -> list[dict]:
        """
        Retrieve relevant chunks across one or more documents.

        If single document, delegates to retrieve().
        If multiple documents, searches each FAISS index, merges results,
        sorts globally by score, and returns top_k.
        """
        if len(document_ids) == 1:
            return self.retrieve(query, document_ids[0], top_k, topic_filter)

        # Sanitize topic filter
        if topic_filter and topic_filter.strip().lower() in ("", "string", "null", "none"):
            topic_filter = None

        # Encode query once
        query_embedding = self.embedding_service.encode_query(query)

        # Search across all document indices
        search_results = vector_store.search_multiple_documents(
            document_ids, query_embedding, top_k=top_k * 2
        )

        if not search_results:
            logger.warning(f"No FAISS results across documents {document_ids}")
            return []

        # Fetch chunk data from database
        faiss_ids = [r["faiss_id"] for r in search_results]
        chunks = self.doc_repo.get_chunks_by_faiss_ids(faiss_ids)
        chunk_map = {c.faiss_id: c for c in chunks}

        # Assemble results
        results = []
        for sr in search_results:
            chunk = chunk_map.get(sr["faiss_id"])
            if chunk is None:
                continue

            if topic_filter and chunk.topic != topic_filter:
                continue

            results.append({
                "text": chunk.text,
                "page_number": chunk.page_number,
                "topic": chunk.topic,
                "chunk_index": chunk.chunk_index,
                "score": sr["score"],
                "confidence": sr["confidence"],
                "faiss_id": sr["faiss_id"],
                "document_id": sr.get("document_id"),
            })

        # Already sorted by score from vector_store, just limit
        results = results[:top_k]

        logger.info(
            f"Retrieved {len(results)} chunks across {len(document_ids)} documents"
        )
        return results

