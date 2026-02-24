from __future__ import annotations

"""
MCQ generation and evaluation service.
Generates multiple-choice questions from document chunks via LLM.
"""

import json
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.services.retrieval_service import RetrievalService
from app.services.generation_service import get_generation_service
from app.rag.prompts import build_mcq_prompt
from app.db.models.mcq_attempt import MCQAttempt
from app.db.repositories.progress_repo import ProgressRepository
from app.schemas.mcq import (
    MCQGenerateRequest,
    MCQGenerateResponse,
    MCQQuestion,
    MCQOption,
    MCQSubmitRequest,
    MCQSubmitResponse,
    MCQResultQuestion,
)
from app.core.constants import MCQMode

logger = logging.getLogger(__name__)


class MCQService:
    """
    Handles MCQ generation from document context and answer evaluation.
    Supports Study mode (answers shown) and Practice mode (answers hidden, evaluated on submit).
    """

    def __init__(self, db: Session):
        self.db = db
        self.retrieval_service = RetrievalService(db)
        self.progress_repo = ProgressRepository(db)

    def generate_mcqs(
        self,
        request: MCQGenerateRequest,
        user_id: int,
    ) -> MCQGenerateResponse:
        """
        Generate MCQs from document context.

        In Study mode: answers and explanations are included.
        In Practice mode: answers are hidden; an attempt is created for later submission.
        """
        # Step 1: Retrieve relevant chunks
        # Use a broad query to get representative content
        query = f"Key concepts and important information about {request.topic or 'this document'}"
        retrieved = self.retrieval_service.retrieve(
            query=query,
            document_id=request.document_id,
            top_k=8,
            topic_filter=request.topic,
        )

        if not retrieved:
            return MCQGenerateResponse(
                document_id=request.document_id,
                topic=request.topic,
                mode=request.mode,
                questions=[],
            )

        # Step 2: Generate MCQs via LLM
        context_chunks = [r["text"] for r in retrieved]
        prompt = build_mcq_prompt(context_chunks, count=request.count)

        generation_service = get_generation_service()
        raw_output = generation_service.generate_structured(prompt)

        # Step 3: Parse LLM output
        questions = self._parse_mcq_output(raw_output, request.mode)

        # Step 4: For practice mode, create an attempt record
        attempt_id = None
        if request.mode == MCQMode.PRACTICE and questions:
            attempt = MCQAttempt(
                user_id=user_id,
                document_id=request.document_id,
                topic=request.topic,
                mode=request.mode.value,
                total_questions=len(questions),
                questions_data=self._serialize_questions(questions),
            )
            attempt = self.progress_repo.create_mcq_attempt(attempt)
            attempt_id = attempt.id

        return MCQGenerateResponse(
            document_id=request.document_id,
            topic=request.topic,
            mode=request.mode,
            questions=questions,
            attempt_id=attempt_id,
        )

    def evaluate_submission(
        self,
        request: MCQSubmitRequest,
        user_id: int,
    ) -> MCQSubmitResponse:
        """Evaluate a practice mode MCQ submission."""
        # Fetch the attempt
        attempt = (
            self.db.query(MCQAttempt)
            .filter(MCQAttempt.id == request.attempt_id, MCQAttempt.user_id == user_id)
            .first()
        )
        if not attempt or not attempt.questions_data:
            raise ValueError("MCQ attempt not found or already evaluated.")

        # Parse stored questions
        stored_questions = attempt.questions_data

        # Evaluate answers
        results = []
        correct_count = 0

        answer_map = {a.question_id: a.selected_answer for a in request.answers}

        for q in stored_questions:
            q_id = q["id"]
            selected = answer_map.get(q_id, "")
            correct = q["correct_answer"]
            is_correct = selected.upper() == correct.upper()

            if is_correct:
                correct_count += 1

            results.append(MCQResultQuestion(
                id=q_id,
                question=q["question"],
                selected_answer=selected,
                correct_answer=correct,
                is_correct=is_correct,
                explanation=q.get("explanation", ""),
            ))

        # Calculate score
        score = (correct_count / len(stored_questions)) * 100 if stored_questions else 0

        # Update attempt record
        attempt.correct_answers = correct_count
        attempt.score = score
        self.db.commit()

        # Update progress
        self.progress_repo.update_performance(
            user_id=user_id,
            document_id=attempt.document_id,
            topic=attempt.topic,
            mcq_score=score,
        )

        return MCQSubmitResponse(
            attempt_id=attempt.id,
            total_questions=len(stored_questions),
            correct_count=correct_count,
            score=round(score, 2),
            results=results,
        )

    def _parse_mcq_output(self, raw_output: str, mode: MCQMode) -> list[MCQQuestion]:
        """Parse LLM JSON output into MCQQuestion objects."""
        try:
            # Try to extract JSON array from output
            start = raw_output.find('[')
            end = raw_output.rfind(']') + 1
            if start == -1 or end == 0:
                logger.error("No JSON array found in MCQ output")
                return []

            json_str = raw_output[start:end]
            data = json.loads(json_str)

            questions = []
            for idx, item in enumerate(data):
                options = [
                    MCQOption(label=label, text=text)
                    for label, text in item.get("options", {}).items()
                ]

                q = MCQQuestion(
                    id=idx + 1,
                    question=item.get("question", ""),
                    options=options,
                    correct_answer=item.get("correct_answer") if mode == MCQMode.STUDY else None,
                    explanation=item.get("explanation") if mode == MCQMode.STUDY else None,
                )
                questions.append(q)

            return questions

        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Failed to parse MCQ output: {e}")
            return []

    def _serialize_questions(self, questions: list[MCQQuestion]) -> list[dict]:
        """Serialize questions with answers for storage (practice mode)."""
        return [
            {
                "id": q.id,
                "question": q.question,
                "options": {opt.label: opt.text for opt in q.options},
                "correct_answer": q.correct_answer or "",
                "explanation": q.explanation or "",
            }
            for q in questions
        ]
