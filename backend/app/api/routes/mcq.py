"""
MCQ routes — generate and evaluate multiple choice questions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.mcq_service import MCQService
from app.schemas.mcq import (
    MCQGenerateRequest,
    MCQGenerateResponse,
    MCQSubmitRequest,
    MCQSubmitResponse,
)

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcq", tags=["MCQ Generation & Evaluation"])


@router.post("/generate", response_model=MCQGenerateResponse)
def generate_mcqs(
    request: MCQGenerateRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Generate MCQs from document content.

    Study Mode: Returns questions with correct answers and explanations.
    Practice Mode: Returns questions without answers. Use /mcq/submit to evaluate.
    """
    try:
        service = MCQService(db)
        return service.generate_mcqs(request, user_id)
    except Exception as e:
        logger.error(f"MCQ generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"MCQ generation failed: {str(e)}")


@router.post("/submit", response_model=MCQSubmitResponse)
def submit_mcq_answers(
    request: MCQSubmitRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Submit answers for a practice mode MCQ test.

    Returns score, correct answers, and explanations.
    Updates student progress tracking.
    """
    service = MCQService(db)
    return service.evaluate_submission(request, user_id)
