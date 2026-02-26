"""
History routes — retrieve Q&A and MCQ history for the current user.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.db.models.qa_history import QuestionAnswerHistory
from app.db.models.mcq_history import MCQHistory
from app.schemas.history import QAHistoryItem, MCQHistoryItem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/questions", response_model=list[QAHistoryItem])
def get_question_history(
    document_id: Optional[int] = Query(None),
    mode: Optional[str] = Query(None),
    marks: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return Q&A history for the logged-in user, newest first, with pagination."""
    try:
        query = db.query(QuestionAnswerHistory).filter(
            QuestionAnswerHistory.user_id == user_id
        )
        if document_id is not None:
            query = query.filter(QuestionAnswerHistory.document_id == document_id)
        if mode is not None:
            query = query.filter(QuestionAnswerHistory.mode == mode)
        if marks is not None:
            query = query.filter(QuestionAnswerHistory.marks == marks)

        return query.order_by(QuestionAnswerHistory.created_at.desc()).offset(offset).limit(limit).all()
    except Exception as e:
        logger.error(f"Failed to fetch Q&A history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load Q&A history")


@router.get("/mcqs", response_model=list[MCQHistoryItem])
def get_mcq_history(
    document_id: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return MCQ history for the logged-in user, newest first, with pagination."""
    try:
        query = db.query(MCQHistory).filter(
            MCQHistory.user_id == user_id
        )
        if document_id is not None:
            query = query.filter(MCQHistory.document_id == document_id)
        if difficulty is not None:
            query = query.filter(MCQHistory.difficulty == difficulty)

        return query.order_by(MCQHistory.created_at.desc()).offset(offset).limit(limit).all()
    except Exception as e:
        logger.error(f"Failed to fetch MCQ history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load MCQ history")

