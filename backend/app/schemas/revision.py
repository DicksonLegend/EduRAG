from __future__ import annotations

"""
Pydantic schemas for revision notes generation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class RevisionRequest(BaseModel):
    document_id: int
    topic: Optional[str] = None


class KeyDefinition(BaseModel):
    term: str
    definition: str


class ExamQuestion(BaseModel):
    question: str
    suggested_marks: int


class RevisionResponse(BaseModel):
    document_id: int
    topic: Optional[str]
    summary_points: list[str]
    key_definitions: list[KeyDefinition]
    likely_exam_questions: list[ExamQuestion]
