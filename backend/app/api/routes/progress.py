"""
Progress tracking routes — view learning progress and weak areas.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.progress_service import ProgressService
from app.schemas.progress import StudentOverview

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])


@router.get("/overview", response_model=StudentOverview)
def get_progress_overview(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get comprehensive learning progress overview.

    Includes:
    - Total questions asked
    - MCQ performance per topic
    - Weak areas (topics below 50% score)
    - Suggested revision topics
    """
    service = ProgressService(db)
    return service.get_student_overview(user_id)
