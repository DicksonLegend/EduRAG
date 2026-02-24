"""
Document processing service — handles PDF upload, text extraction,
chunking, embedding, and FAISS indexing.
"""

import hashlib
import logging
import shutil
from pathlib import Path
from typing import Optional

import numpy as np
from sqlalchemy.orm import Session

from app.config import settings
from app.core.constants import DocumentStatus
from app.core.exceptions import (
    InvalidFileError,
    FileTooLargeError,
    DocumentProcessingError,
)
from app.db.models.chunk import Chunk
from app.db.models.topic import Topic
from app.db.repositories.document_repo import DocumentRepository
from app.rag.text_extractor import extract_text_from_pdf
from app.rag.chunker import SmartChunker, propagate_topics
from app.services.embedding_service import get_embedding_service
from app.rag.vector_store import vector_store

logger = logging.getLogger(__name__)


class DocumentService:
    """
    Handles the complete document processing pipeline:
    1. Validate & save uploaded PDF
    2. Extract text (PyMuPDF + OCR fallback)
    3. Chunk text into overlapping segments
    4. Generate embeddings
    5. Store in FAISS index
    6. Persist metadata to database
    """

    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.chunker = SmartChunker(
            min_words=settings.CHUNK_MIN_WORDS,
            max_words=settings.CHUNK_MAX_WORDS,
            overlap_words=settings.CHUNK_OVERLAP_WORDS,
        )

    def validate_file(self, filename: str, file_size: int):
        """Validate file extension and size."""
        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise InvalidFileError(f"Only PDF files are allowed. Got: {ext}")
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise FileTooLargeError(settings.MAX_FILE_SIZE_MB)

    def compute_file_hash(self, file_content: bytes) -> str:
        """Compute SHA-256 hash of file content for deduplication."""
        return hashlib.sha256(file_content).hexdigest()

    async def upload_and_process(
        self,
        filename: str,
        file_content: bytes,
        user_id: int,
    ) -> dict:
        """
        Upload a PDF and process it through the full pipeline.

        Args:
            filename: Original filename.
            file_content: Raw file bytes.
            user_id: ID of the uploading user.

        Returns:
            Dict with document_id and status.
        """
        # Step 1: Validate
        self.validate_file(filename, len(file_content))

        # Step 2: Check for duplicates
        file_hash = self.compute_file_hash(file_content)
        existing = self.doc_repo.get_by_hash(file_hash)
        if existing:
            return {
                "document_id": existing.id,
                "status": existing.status,
                "message": "Document already exists.",
            }

        # Step 3: Save file to disk
        safe_filename = f"{file_hash[:12]}_{filename}"
        file_path = settings.UPLOAD_DIR / safe_filename
        file_path.write_bytes(file_content)

        # Step 4: Create database record
        document = self.doc_repo.create_document(
            filename=filename,
            file_hash=file_hash,
            file_path=str(file_path),
            uploaded_by=user_id,
        )

        # Step 5: Process the document
        try:
            self.doc_repo.update_status(document.id, DocumentStatus.PROCESSING)
            self._process_document(document.id, str(file_path), filename)
            return {
                "document_id": document.id,
                "status": DocumentStatus.COMPLETED,
                "message": "Document processed successfully.",
            }
        except Exception as e:
            logger.error(f"Document processing failed: {e}")
            self.doc_repo.update_status(
                document.id,
                DocumentStatus.FAILED,
                error_message=str(e)[:500],
            )
            raise DocumentProcessingError(f"Failed to process document: {str(e)[:200]}")

    def _process_document(self, document_id: int, file_path: str, filename: str):
        """
        Internal processing pipeline.

        Steps: Extract text → Chunk → Embed → Store in FAISS → Save metadata.
        """
        # Step A: Extract text
        pages = extract_text_from_pdf(file_path, settings.TESSERACT_CMD)
        if not pages:
            raise DocumentProcessingError("No text could be extracted from the PDF.")

        total_pages = len(pages)

        # Step B: Chunk text
        raw_chunks = self.chunker.chunk_pages(pages, filename)
        raw_chunks = propagate_topics(raw_chunks)

        if not raw_chunks:
            raise DocumentProcessingError("Document produced no valid chunks.")

        # Step C: Generate embeddings
        embedding_service = get_embedding_service()
        texts = [c["text"] for c in raw_chunks]
        embeddings = embedding_service.encode_documents(texts)

        # Step D: Create Chunk records and assign FAISS IDs
        db_chunks = []
        faiss_ids = []
        for idx, chunk_data in enumerate(raw_chunks):
            faiss_id = document_id * 100_000 + idx  # Unique FAISS ID
            db_chunk = Chunk(
                document_id=document_id,
                text=chunk_data["text"],
                page_number=chunk_data["page_number"],
                chunk_index=chunk_data["chunk_index"],
                topic=chunk_data["topic"],
                word_count=chunk_data["word_count"],
                faiss_id=faiss_id,
            )
            db_chunks.append(db_chunk)
            faiss_ids.append(faiss_id)

        # Step E: Add to FAISS index
        faiss_id_array = np.array(faiss_ids, dtype=np.int64)
        vector_store.add_embeddings(document_id, embeddings, faiss_id_array)
        vector_store.save_index(document_id)

        # Step F: Save chunks to database
        self.doc_repo.add_chunks(db_chunks)

        # Step G: Extract and save topics
        unique_topics = {}
        for chunk_data in raw_chunks:
            topic_name = chunk_data.get("topic")
            if topic_name and topic_name not in unique_topics:
                unique_topics[topic_name] = {
                    "page_start": chunk_data["page_number"],
                    "page_end": chunk_data["page_number"],
                    "chunk_count": 1,
                }
            elif topic_name:
                unique_topics[topic_name]["page_end"] = chunk_data["page_number"]
                unique_topics[topic_name]["chunk_count"] += 1

        db_topics = [
            Topic(
                document_id=document_id,
                name=name,
                page_start=info["page_start"],
                page_end=info["page_end"],
                chunk_count=info["chunk_count"],
            )
            for name, info in unique_topics.items()
        ]
        if db_topics:
            self.doc_repo.add_topics(db_topics)

        # Step H: Update document record
        self.doc_repo.update_status(
            document_id,
            DocumentStatus.COMPLETED,
            total_pages=total_pages,
            total_chunks=len(db_chunks),
        )

        logger.info(
            f"Document {document_id} processed: "
            f"{total_pages} pages, {len(db_chunks)} chunks, "
            f"{len(db_topics)} topics"
        )
