from __future__ import annotations

"""
Pydantic schemas for MCQ generation and evaluation.
"""

from pydantic import BaseModel, Field
from typing import Optional

from app.core.constants import MCQMode


class MCQGenerateRequest(BaseModel):
    document_id: int
    topic: Optional[str] = None
    count: int = Field(default=5, ge=3, le=15)
    mode: MCQMode = MCQMode.STUDY


class MCQOption(BaseModel):
    label: str  # A, B, C, D
    text: str


class MCQQuestion(BaseModel):
    id: int
    question: str
    options: list[MCQOption]
    correct_answer: Optional[str] = None  # Hidden in practice mode
    explanation: Optional[str] = None     # Hidden in practice mode


class MCQGenerateResponse(BaseModel):
    document_id: int
    topic: Optional[str]
    mode: MCQMode
    questions: list[MCQQuestion]
    attempt_id: Optional[int] = None  # For practice mode submissions


class MCQAnswer(BaseModel):
    question_id: int
    selected_answer: str  # A, B, C, D


class MCQSubmitRequest(BaseModel):
    attempt_id: int
    answers: list[MCQAnswer]


class MCQResultQuestion(BaseModel):
    id: int
    question: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str


class MCQSubmitResponse(BaseModel):
    attempt_id: int
    total_questions: int
    correct_count: int
    score: float  # Percentage
    results: list[MCQResultQuestion]
