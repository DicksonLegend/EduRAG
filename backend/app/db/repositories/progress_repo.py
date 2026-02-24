"""
Data access layer for Progress and MCQAttempt operations.
"""

from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.models.progress import Progress
from app.db.models.mcq_attempt import MCQAttempt


class ProgressRepository:
    """Encapsulates all database operations for progress tracking."""

    def __init__(self, db: Session):
        self.db = db

    # ── Progress ─────────────────────────────────────────────────

    def get_or_create_progress(
        self, user_id: int, document_id: int, topic: Optional[str] = None
    ) -> Progress:
        """Get existing progress record or create a new one."""
        progress = (
            self.db.query(Progress)
            .filter(
                Progress.user_id == user_id,
                Progress.document_id == document_id,
                Progress.topic == topic,
            )
            .first()
        )
        if not progress:
            progress = Progress(
                user_id=user_id,
                document_id=document_id,
                topic=topic,
            )
            self.db.add(progress)
            self.db.commit()
            self.db.refresh(progress)
        return progress

    def increment_questions(
        self, user_id: int, document_id: int, topic: Optional[str] = None
    ):
        progress = self.get_or_create_progress(user_id, document_id, topic)
        progress.questions_asked += 1
        self.db.commit()

    def get_user_progress(self, user_id: int) -> list[Progress]:
        return (
            self.db.query(Progress)
            .filter(Progress.user_id == user_id)
            .order_by(Progress.last_accessed.desc())
            .all()
        )

    def get_weak_topics(self, user_id: int, threshold: float = 50.0) -> list[Progress]:
        """Get topics where student performance is below threshold."""
        return (
            self.db.query(Progress)
            .filter(
                Progress.user_id == user_id,
                Progress.performance_score < threshold,
                Progress.mcq_attempts_count > 0,
            )
            .order_by(Progress.performance_score.asc())
            .all()
        )

    def update_performance(
        self,
        user_id: int,
        document_id: int,
        topic: Optional[str],
        mcq_score: float,
    ):
        """Update performance score after an MCQ attempt."""
        progress = self.get_or_create_progress(user_id, document_id, topic)
        progress.mcq_attempts_count += 1
        # Running average
        old_total = progress.mcq_average_score * (progress.mcq_attempts_count - 1)
        progress.mcq_average_score = (old_total + mcq_score) / progress.mcq_attempts_count
        progress.performance_score = progress.mcq_average_score
        self.db.commit()

    # ── MCQ Attempts ─────────────────────────────────────────────

    def create_mcq_attempt(self, attempt: MCQAttempt) -> MCQAttempt:
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        return attempt

    def get_user_mcq_attempts(self, user_id: int) -> list[MCQAttempt]:
        return (
            self.db.query(MCQAttempt)
            .filter(MCQAttempt.user_id == user_id)
            .order_by(MCQAttempt.created_at.desc())
            .all()
        )

    def get_topic_average_score(self, user_id: int, topic: str) -> float:
        """Get average MCQ score for a specific topic."""
        result = (
            self.db.query(func.avg(MCQAttempt.score))
            .filter(MCQAttempt.user_id == user_id, MCQAttempt.topic == topic)
            .scalar()
        )
        return result or 0.0
