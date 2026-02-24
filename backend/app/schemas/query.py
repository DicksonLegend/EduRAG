from __future__ import annotations

"""
Pydantic schemas for RAG query endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional

from app.core.constants import ExplanationMode, MarkScheme


class QueryRequest(BaseModel):
    """Request schema for RAG-based question answering."""
    question: str = Field(..., min_length=3, max_length=1000)
    document_id: int
    topic: Optional[str] = None
    mode: ExplanationMode = ExplanationMode.DETAILED
    marks: Optional[MarkScheme] = None


class SourcePage(BaseModel):
    page_number: int
    chunk_preview: str = Field(..., description="First 100 chars of the chunk")
    relevance_score: float


class QueryResponse(BaseModel):
    """Structured response from the RAG pipeline."""
    answer: str
    mode: str
    marks: Optional[int] = None
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    source_pages: list[SourcePage]
    topic: Optional[str] = None
