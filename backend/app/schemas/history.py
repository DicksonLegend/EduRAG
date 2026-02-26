from __future__ import annotations

"""
Pydantic schemas for history endpoints.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QAHistoryItem(BaseModel):
    id: int
    document_id: Optional[int]
    question: str
    answer: str
    mode: str
    marks: Optional[int]
    confidence_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class MCQHistoryItem(BaseModel):
    id: int
    document_id: Optional[int]
    question: str
    options: dict
    correct_answer: str
    selected_answer: Optional[str]
    difficulty: str
    topic: Optional[str]
    is_correct: Optional[bool]
    created_at: datetime

    class Config:
        from_attributes = True
