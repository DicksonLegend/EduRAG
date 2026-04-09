from __future__ import annotations

"""
Data access layer for Document and Chunk operations.
"""

from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.document import Document
from app.db.models.chunk import Chunk
from app.db.models.topic import Topic
from app.core.constants import DocumentStatus


class DocumentRepository:
    """Encapsulates all database operations for Documents, Chunks, and Topics."""

    def __init__(self, db: Session):
        self.db = db

    # ── Document CRUD ────────────────────────────────────────────

    def create_document(
        self,
        filename: str,
        file_hash: str,
        file_path: str,
        uploaded_by: int,
    ) -> Document:
        doc = Document(
            filename=filename,
            file_hash=file_hash,
            file_path=file_path,
            uploaded_by=uploaded_by,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_document(self, document_id: int) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def get_by_hash(self, file_hash: str, user_id: Optional[int] = None) -> Optional[Document]:
        query = self.db.query(Document).filter(Document.file_hash == file_hash)
        if user_id is not None:
            query = query.filter(Document.uploaded_by == user_id)
        return query.first()

    def get_user_documents(self, user_id: int) -> list[Document]:
        return (
            self.db.query(Document)
            .filter(Document.uploaded_by == user_id)
            .order_by(Document.created_at.desc())
            .all()
        )

    def update_status(
        self,
        document_id: int,
        status: DocumentStatus,
        total_pages: int = 0,
        total_chunks: int = 0,
        error_message: Optional[str] = None,
    ):
        doc = self.get_document(document_id)
        if doc:
            doc.status = status
            doc.total_pages = total_pages
            doc.total_chunks = total_chunks
            doc.error_message = error_message
            if status == DocumentStatus.COMPLETED:
                doc.processed_at = datetime.now(timezone.utc)
            self.db.commit()

    # ── Chunk CRUD ───────────────────────────────────────────────

    def add_chunks(self, chunks: list[Chunk]):
        self.db.add_all(chunks)
        self.db.commit()

    def get_chunks_by_document(self, document_id: int) -> list[Chunk]:
        return (
            self.db.query(Chunk)
            .filter(Chunk.document_id == document_id)
            .order_by(Chunk.chunk_index)
            .all()
        )

    def get_chunks_by_topic(self, document_id: int, topic: str) -> list[Chunk]:
        return (
            self.db.query(Chunk)
            .filter(Chunk.document_id == document_id, Chunk.topic == topic)
            .order_by(Chunk.chunk_index)
            .all()
        )

    def get_chunks_by_faiss_ids(self, faiss_ids: list[int]) -> list[Chunk]:
        return self.db.query(Chunk).filter(Chunk.faiss_id.in_(faiss_ids)).all()

    # ── Topic CRUD ───────────────────────────────────────────────

    def add_topics(self, topics: list[Topic]):
        self.db.add_all(topics)
        self.db.commit()

    def get_topics_by_document(self, document_id: int) -> list[Topic]:
        return (
            self.db.query(Topic)
            .filter(Topic.document_id == document_id)
            .order_by(Topic.page_start)
            .all()
        )
