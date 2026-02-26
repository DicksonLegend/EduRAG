"""
MCQ routes — generate and evaluate multiple choice questions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.mcq_service import MCQService
from app.db.models.mcq_history import MCQHistory
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
    Auto-saves all generated MCQs to history.
    """
    try:
        service = MCQService(db)
        result = service.generate_mcqs(request, user_id)
    except Exception as e:
        logger.error(f"MCQ generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"MCQ generation failed: {str(e)}")

    # Auto-save each MCQ to history
    try:
        for q in result.questions:
            # Build options dict from MCQOption list
            options_dict = {opt.label: opt.text for opt in q.options}
            history_entry = MCQHistory(
                user_id=user_id,
                document_id=request.document_id,
                question=q.question,
                options=options_dict,
                correct_answer=q.correct_answer or "",
                selected_answer=None,
                difficulty=request.difficulty.value,
                topic=request.topic,
                is_correct=None,
            )
            db.add(history_entry)
        db.commit()
    except Exception as e:
        logger.warning(f"Failed to save MCQ history: {e}")
        db.rollback()

    return result


@router.post("/submit", response_model=MCQSubmitResponse)
def submit_mcq_answers(
    request: MCQSubmitRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Submit answers for a practice mode MCQ test.

    Returns score, correct answers, and explanations.
    Updates student progress tracking and MCQ history.
    """
    service = MCQService(db)
    result = service.evaluate_submission(request, user_id)

    # Update MCQ history with selected answers and correctness
    try:
        for r in result.results:
            # Find the most recent matching MCQ history entry for this user+question
            entry = (
                db.query(MCQHistory)
                .filter(
                    MCQHistory.user_id == user_id,
                    MCQHistory.question == r.question,
                    MCQHistory.selected_answer.is_(None),
                )
                .order_by(MCQHistory.created_at.desc())
                .first()
            )
            if entry:
                entry.selected_answer = r.selected_answer
                entry.is_correct = r.is_correct
        db.commit()
    except Exception as e:
        logger.warning(f"Failed to update MCQ history: {e}")
        db.rollback()

    return result

