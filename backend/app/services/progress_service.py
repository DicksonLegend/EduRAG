"""
Progress tracking service — monitors student learning and identifies weak areas.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.db.repositories.progress_repo import ProgressRepository
from app.schemas.progress import (
    ProgressResponse,
    WeakTopicResponse,
    StudentOverview,
)

logger = logging.getLogger(__name__)


class ProgressService:
    """Tracks student learning progress and computes performance analytics."""

    def __init__(self, db: Session):
        self.db = db
        self.progress_repo = ProgressRepository(db)

    def record_question(self, user_id: int, document_id: int, topic: Optional[str] = None):
        """Record that a student asked a question."""
        self.progress_repo.increment_questions(user_id, document_id, topic)

    def get_student_overview(self, user_id: int) -> StudentOverview:
        """Get comprehensive overview of a student's learning progress."""
        progress_records = self.progress_repo.get_user_progress(user_id)
        weak_topics = self.progress_repo.get_weak_topics(user_id)

        total_questions = sum(p.questions_asked for p in progress_records)
        total_mcq_attempts = sum(p.mcq_attempts_count for p in progress_records)

        scores = [p.mcq_average_score for p in progress_records if p.mcq_attempts_count > 0]
        overall_avg = sum(scores) / len(scores) if scores else 0.0

        topics_accessed = len(set(p.topic for p in progress_records if p.topic))

        weak_topic_responses = [
            WeakTopicResponse(
                topic=w.topic or "General",
                document_id=w.document_id,
                mcq_average_score=round(w.mcq_average_score, 2),
                performance_score=round(w.performance_score, 2),
                suggestion=f"Revise '{w.topic or 'General'}' — score is below 50%.",
            )
            for w in weak_topics
        ]

        progress_responses = [
            ProgressResponse(
                topic=p.topic,
                document_id=p.document_id,
                questions_asked=p.questions_asked,
                mcq_attempts_count=p.mcq_attempts_count,
                mcq_average_score=round(p.mcq_average_score, 2),
                performance_score=round(p.performance_score, 2),
                last_accessed=p.last_accessed,
            )
            for p in progress_records
        ]

        return StudentOverview(
            total_questions_asked=total_questions,
            total_mcq_attempts=total_mcq_attempts,
            overall_average_score=round(overall_avg, 2),
            topics_accessed=topics_accessed,
            weak_topics=weak_topic_responses,
            progress=progress_responses,
        )
