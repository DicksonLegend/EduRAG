"""
RAG Service — orchestrates retrieval + generation for question answering.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.services.retrieval_service import RetrievalService
from app.services.generation_service import get_generation_service
from app.rag.prompts import build_rag_prompt
from app.schemas.query import QueryRequest, QueryResponse, SourcePage
from app.core.constants import ExplanationMode

logger = logging.getLogger(__name__)


class RAGService:
    """
    Orchestrates the full RAG pipeline:
    1. Retrieve relevant chunks via FAISS (single or multi-document)
    2. Build mode-aware prompt
    3. Generate answer via LLM
    4. Return structured response with confidence and sources
    """

    def __init__(self, db: Session):
        self.db = db
        self.retrieval_service = RetrievalService(db)

    def answer_question(self, request: QueryRequest) -> QueryResponse:
        """
        Process a RAG query and return a structured answer.

        Args:
            request: QueryRequest with question, document_ids, mode, marks.

        Returns:
            QueryResponse with answer, confidence, source pages.
        """
        # Step 1: Retrieve relevant chunks (supports single and multi-doc)
        retrieved = self.retrieval_service.retrieve_multi(
            query=request.question,
            document_ids=request.document_ids,
            topic_filter=request.topic,
        )

        if not retrieved:
            return QueryResponse(
                answer="The provided documents do not contain sufficient information to answer this question.",
                mode=request.mode.value,
                marks=request.marks.value if request.marks else None,
                confidence_score=0.0,
                source_pages=[],
                topic=request.topic,
            )

        # Step 2: Build prompt
        context_chunks = [r["text"] for r in retrieved]
        prompt = build_rag_prompt(
            question=request.question,
            context_chunks=context_chunks,
            mode=request.mode.value,
            marks=request.marks.value if request.marks else None,
        )

        # Step 3: Generate answer
        generation_service = get_generation_service()
        answer = generation_service.generate(prompt)

        # Step 4: Compute confidence (average of top chunk scores)
        avg_confidence = sum(r["confidence"] for r in retrieved) / len(retrieved)

        # Step 5: Build source pages
        source_pages = [
            SourcePage(
                page_number=r["page_number"],
                chunk_preview=r["text"][:100] + "..." if len(r["text"]) > 100 else r["text"],
                relevance_score=round(r["confidence"], 2),
            )
            for r in retrieved
        ]

        # Deduplicate by page number, keep highest relevance
        seen_pages = {}
        for sp in source_pages:
            if sp.page_number not in seen_pages or sp.relevance_score > seen_pages[sp.page_number].relevance_score:
                seen_pages[sp.page_number] = sp
        source_pages = sorted(seen_pages.values(), key=lambda x: x.relevance_score, reverse=True)

        return QueryResponse(
            answer=answer,
            mode=request.mode.value,
            marks=request.marks.value if request.marks else None,
            confidence_score=round(avg_confidence, 2),
            source_pages=source_pages,
            topic=request.topic,
        )

