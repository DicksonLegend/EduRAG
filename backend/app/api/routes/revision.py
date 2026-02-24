"""
Revision notes generation routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.revision_service import RevisionService
from app.schemas.revision import RevisionRequest, RevisionResponse

router = APIRouter(prefix="/revision", tags=["Revision Generator"])


@router.post("/generate", response_model=RevisionResponse)
def generate_revision_notes(
    request: RevisionRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Generate revision notes for a document or topic.

    Returns:
    - Summary bullet points (8–12 key concepts)
    - Key definitions extracted from content
    - Likely exam questions with suggested marks
    """
    service = RevisionService(db)
    return service.generate_revision_notes(request)
