from __future__ import annotations

"""
Pydantic schemas for progress tracking endpoints.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProgressResponse(BaseModel):
    topic: Optional[str]
    document_id: int
    questions_asked: int
    mcq_attempts_count: int
    mcq_average_score: float
    performance_score: float
    last_accessed: datetime

    model_config = {"from_attributes": True}


class WeakTopicResponse(BaseModel):
    topic: str
    document_id: int
    mcq_average_score: float
    performance_score: float
    suggestion: str = "Revision recommended"


class StudentOverview(BaseModel):
    total_questions_asked: int
    total_mcq_attempts: int
    overall_average_score: float
    topics_accessed: int
    weak_topics: list[WeakTopicResponse]
    progress: list[ProgressResponse]
