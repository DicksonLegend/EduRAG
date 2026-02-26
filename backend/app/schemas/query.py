from __future__ import annotations

"""
Pydantic schemas for RAG query endpoints.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional

from app.core.constants import ExplanationMode, MarkScheme


class QueryRequest(BaseModel):
    """Request schema for RAG-based question answering."""
    question: str = Field(..., min_length=3, max_length=1000)
    document_ids: list[int] = Field(..., min_length=1, description="List of document IDs to search")
    topic: Optional[str] = None
    mode: ExplanationMode = ExplanationMode.DETAILED
    marks: Optional[MarkScheme] = None

    @model_validator(mode="before")
    @classmethod
    def accept_single_document_id(cls, data):
        """Backward compat: accept 'document_id' and convert to 'document_ids'."""
        if isinstance(data, dict):
            if "document_id" in data and "document_ids" not in data:
                data["document_ids"] = [data.pop("document_id")]
        return data


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

