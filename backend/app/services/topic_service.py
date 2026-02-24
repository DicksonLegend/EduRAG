"""
Topic-wise learning service — detects, lists, and filters learning by topic.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.db.repositories.document_repo import DocumentRepository
from app.schemas.document import TopicResponse

logger = logging.getLogger(__name__)


class TopicService:
    """Manages topic-based learning features."""

    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)

    def get_document_topics(self, document_id: int) -> list[TopicResponse]:
        """Get all detected topics for a document."""
        topics = self.doc_repo.get_topics_by_document(document_id)
        return [
            TopicResponse(
                id=t.id,
                name=t.name,
                page_start=t.page_start,
                page_end=t.page_end,
                chunk_count=t.chunk_count,
            )
            for t in topics
        ]

    def get_topic_chunks(self, document_id: int, topic: str) -> list[dict]:
        """Get all chunks for a specific topic."""
        chunks = self.doc_repo.get_chunks_by_topic(document_id, topic)
        return [
            {
                "chunk_index": c.chunk_index,
                "text": c.text,
                "page_number": c.page_number,
                "word_count": c.word_count,
            }
            for c in chunks
        ]
