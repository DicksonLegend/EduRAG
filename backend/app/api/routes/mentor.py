"""
Mentor dashboard routes — view student performance, assign tests.
Requires mentor role.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id, require_role
from app.services.progress_service import ProgressService
from app.services.mcq_service import MCQService
from app.db.repositories.user_repo import UserRepository
from app.db.repositories.progress_repo import ProgressRepository
from app.schemas.mentor import (
    MentorStudentListResponse,
    StudentSummary,
    AssignTestRequest,
    AssignTestResponse,
)
from app.schemas.progress import StudentOverview
from app.schemas.mcq import MCQGenerateRequest
from app.core.constants import MCQMode

router = APIRouter(
    prefix="/mentor",
    tags=["Mentor Dashboard"],
    dependencies=[Depends(require_role("mentor"))],
)


@router.get("/students", response_model=MentorStudentListResponse)
def list_students(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """List all students with summary performance data."""
    user_repo = UserRepository(db)
    progress_repo = ProgressRepository(db)
    students = user_repo.get_students()

    summaries = []
    for student in students:
        progress = progress_repo.get_user_progress(student.id)
        mcq_attempts = progress_repo.get_user_mcq_attempts(student.id)

        scores = [a.score for a in mcq_attempts]
        overall_score = sum(scores) / len(scores) if scores else 0.0

        summaries.append(StudentSummary(
            id=student.id,
            username=student.username,
            full_name=student.full_name,
            total_documents=len(student.documents),
            total_mcq_attempts=len(mcq_attempts),
            overall_score=round(overall_score, 2),
        ))

    return MentorStudentListResponse(
        total_students=len(summaries),
        students=summaries,
    )


@router.get("/students/{student_id}/performance", response_model=StudentOverview)
def get_student_performance(
    student_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """View detailed performance data for a specific student."""
    service = ProgressService(db)
    return service.get_student_overview(student_id)


@router.post("/assign-test", response_model=AssignTestResponse)
def assign_practice_test(
    request: AssignTestRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Assign a practice MCQ test to a student."""
    mcq_service = MCQService(db)
    mcq_request = MCQGenerateRequest(
        document_id=request.document_id,
        topic=request.topic,
        count=request.question_count,
        mode=MCQMode.PRACTICE,
    )
    result = mcq_service.generate_mcqs(mcq_request, request.student_id)

    return AssignTestResponse(
        message=f"Practice test assigned with {len(result.questions)} questions.",
        student_id=request.student_id,
        attempt_id=result.attempt_id or 0,
    )
