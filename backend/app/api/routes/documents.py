"""
Document management routes — upload, list, status, topics.
"""

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.api.middleware.security import validate_pdf_upload
from app.services.document_service import DocumentService
from app.services.topic_service import TopicService
from app.db.repositories.document_repo import DocumentRepository
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentResponse,
    DocumentStatusResponse,
    TopicResponse,
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF document for processing.

    The document will be:
    1. Validated for type and size
    2. Text extracted (PyMuPDF + OCR fallback)
    3. Chunked into overlapping segments
    4. Embedded and indexed in FAISS
    """
    # Validate and read file
    file_content = await validate_pdf_upload(file)

    service = DocumentService(db)
    result = await service.upload_and_process(
        filename=file.filename or "unknown.pdf",
        file_content=file_content,
        user_id=user_id,
    )

    return DocumentUploadResponse(
        id=result["document_id"],
        filename=file.filename or "unknown.pdf",
        status=result["status"],
        message=result["message"],
    )


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """List all documents uploaded by the current user."""
    repo = DocumentRepository(db)
    docs = repo.get_user_documents(user_id)
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get the processing status of a document."""
    repo = DocumentRepository(db)
    doc = repo.get_document(document_id)
    if not doc:
        from app.core.exceptions import DocumentNotFoundError
        raise DocumentNotFoundError(document_id)
    return DocumentStatusResponse.model_validate(doc)


@router.get("/{document_id}/topics", response_model=list[TopicResponse])
def get_document_topics(
    document_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all detected topics in a document."""
    service = TopicService(db)
    return service.get_document_topics(document_id)
