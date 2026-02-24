"""
Revision notes generation service.
Generates bullet-point summaries, key definitions, and likely exam questions.
"""

import json
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.services.retrieval_service import RetrievalService
from app.services.generation_service import get_generation_service
from app.rag.prompts import build_revision_prompt
from app.schemas.revision import (
    RevisionRequest,
    RevisionResponse,
    KeyDefinition,
    ExamQuestion,
)

logger = logging.getLogger(__name__)


class RevisionService:
    """Generates revision notes from document context via LLM."""

    def __init__(self, db: Session):
        self.db = db
        self.retrieval_service = RetrievalService(db)

    def generate_revision_notes(self, request: RevisionRequest) -> RevisionResponse:
        """
        Generate comprehensive revision notes for a document or topic.

        Retrieves major chunks and uses LLM to produce:
        - Summary bullet points
        - Key definitions
        - Likely exam questions
        """
        # Retrieve broad context
        query = f"Summary of key concepts in {request.topic or 'this document'}"
        retrieved = self.retrieval_service.retrieve(
            query=query,
            document_id=request.document_id,
            top_k=10,  # More chunks for revision notes
            topic_filter=request.topic,
        )

        if not retrieved:
            return RevisionResponse(
                document_id=request.document_id,
                topic=request.topic,
                summary_points=["No content found for revision."],
                key_definitions=[],
                likely_exam_questions=[],
            )

        # Generate revision notes via LLM
        context_chunks = [r["text"] for r in retrieved]
        prompt = build_revision_prompt(context_chunks)

        generation_service = get_generation_service()
        raw_output = generation_service.generate_structured(prompt, max_tokens=2048)

        return self._parse_revision_output(raw_output, request.document_id, request.topic)

    def _parse_revision_output(
        self,
        raw_output: str,
        document_id: int,
        topic: Optional[str],
    ) -> RevisionResponse:
        """Parse LLM JSON output into RevisionResponse."""
        try:
            # Extract JSON object from output
            start = raw_output.find('{')
            end = raw_output.rfind('}') + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON object found")

            data = json.loads(raw_output[start:end])

            summary_points = data.get("summary_points", [])
            key_definitions = [
                KeyDefinition(term=d.get("term", ""), definition=d.get("definition", ""))
                for d in data.get("key_definitions", [])
            ]
            exam_questions = [
                ExamQuestion(question=q.get("question", ""), suggested_marks=q.get("suggested_marks", 5))
                for q in data.get("likely_exam_questions", [])
            ]

            return RevisionResponse(
                document_id=document_id,
                topic=topic,
                summary_points=summary_points,
                key_definitions=key_definitions,
                likely_exam_questions=exam_questions,
            )

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse revision output: {e}")
            return RevisionResponse(
                document_id=document_id,
                topic=topic,
                summary_points=[raw_output[:500]],  # Fallback: raw text
                key_definitions=[],
                likely_exam_questions=[],
            )
