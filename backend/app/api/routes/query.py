"""
RAG query routes — question answering with mode and mark control.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.rag_service import RAGService
from app.services.progress_service import ProgressService
from app.db.models.qa_history import QuestionAnswerHistory
from app.schemas.query import QueryRequest, QueryResponse

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["Question Answering"])


@router.post("/ask", response_model=QueryResponse)
def ask_question(
    request: QueryRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Ask a question about one or more uploaded documents.

    The system will:
    1. Retrieve relevant chunks from selected document(s) via FAISS
    2. Generate an answer using Mistral-7B
    3. Format based on selected mode (beginner/exam/detailed)
    4. Control length based on marks (2/3/5/10)
    5. Return answer with confidence score and source pages
    6. Auto-save the Q&A to history

    Supports single-document (document_ids: [1]) and multi-document (document_ids: [1,2,3]) queries.
    """
    # Generate answer
    try:
        rag_service = RAGService(db)
        response = rag_service.answer_question(request)
    except Exception as e:
        logger.error(f"RAG query failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Question answering failed: {str(e)}")

    # Track progress (non-critical — don't fail the request)
    try:
        progress_service = ProgressService(db)
        for doc_id in request.document_ids:
            progress_service.record_question(user_id, doc_id, request.topic)
    except Exception as e:
        logger.warning(f"Failed to track progress: {e}")

    # Auto-save to Q&A history (non-critical — don't fail the request)
    try:
        is_multi = len(request.document_ids) > 1
        history_entry = QuestionAnswerHistory(
            user_id=user_id,
            document_id=request.document_ids[0] if not is_multi else None,
            document_ids=request.document_ids if is_multi else None,
            question=request.question,
            answer=response.answer,
            mode=request.mode.value,
            marks=request.marks.value if request.marks else None,
            confidence_score=response.confidence_score,
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        logger.warning(f"Failed to save Q&A history: {e}")
        db.rollback()

    return response



