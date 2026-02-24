"""
Topic-wise learning routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.topic_service import TopicService
from app.schemas.document import TopicResponse

router = APIRouter(prefix="/topics", tags=["Topic-Wise Learning"])


@router.get("/{document_id}", response_model=list[TopicResponse])
def get_topics(
    document_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all detected topics for a document."""
    service = TopicService(db)
    return service.get_document_topics(document_id)


@router.get("/{document_id}/{topic_name}/chunks")
def get_topic_chunks(
    document_id: int,
    topic_name: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all text chunks for a specific topic."""
    service = TopicService(db)
    return service.get_topic_chunks(document_id, topic_name)
