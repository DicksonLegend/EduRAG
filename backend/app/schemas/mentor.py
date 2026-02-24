from __future__ import annotations

"""
Pydantic schemas for mentor dashboard endpoints.
"""

from pydantic import BaseModel
from typing import Optional

from app.schemas.progress import StudentOverview


class StudentSummary(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    total_documents: int
    total_mcq_attempts: int
    overall_score: float


class MentorStudentListResponse(BaseModel):
    total_students: int
    students: list[StudentSummary]


class AssignTestRequest(BaseModel):
    student_id: int
    document_id: int
    topic: Optional[str] = None
    question_count: int = 5


class AssignTestResponse(BaseModel):
    message: str
    student_id: int
    attempt_id: int
