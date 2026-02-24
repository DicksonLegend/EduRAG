"""
RAG query routes — question answering with mode and mark control.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id
from app.services.rag_service import RAGService
from app.services.progress_service import ProgressService
from app.schemas.query import QueryRequest, QueryResponse

router = APIRouter(prefix="/query", tags=["Question Answering"])


@router.post("/ask", response_model=QueryResponse)
def ask_question(
    request: QueryRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Ask a question about an uploaded document.

    The system will:
    1. Retrieve relevant chunks from the document via FAISS
    2. Generate an answer using Mistral-7B
    3. Format based on selected mode (beginner/exam/detailed)
    4. Control length based on marks (2/3/5/10)
    5. Return answer with confidence score and source pages

    The answer is strictly generated from document context only.
    """
    # Generate answer
    rag_service = RAGService(db)
    response = rag_service.answer_question(request)

    # Track progress
    progress_service = ProgressService(db)
    progress_service.record_question(user_id, request.document_id, request.topic)

    return response
