"""
Enumerations and constants used across the application.
"""

from enum import Enum


class UserRole(str, Enum):
    """User roles for role-based access control."""
    STUDENT = "student"
    MENTOR = "mentor"


class ExplanationMode(str, Enum):
    """Adaptive explanation modes for RAG responses."""
    BEGINNER = "beginner"
    EXAM = "exam"
    DETAILED = "detailed"


class MarkScheme(int, Enum):
    """Mark-based answer length control."""
    TWO = 2
    THREE = 3
    FIVE = 5
    TEN = 10


class MCQMode(str, Enum):
    """MCQ generation modes."""
    STUDY = "study"       # Show answers immediately
    PRACTICE = "practice"  # Hide answers, evaluate on submission


class MCQDifficulty(str, Enum):
    """MCQ difficulty levels."""
    EASY = "easy"        # Factual recall, straightforward
    MEDIUM = "medium"    # Understanding-based, conceptual
    HARD = "hard"        # Application/analysis, tricky distractors


class DocumentStatus(str, Enum):
    """Document processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Chunk metadata keys ──────────────────────────────────────────
METADATA_FILENAME = "filename"
METADATA_PAGE_NUMBER = "page_number"
METADATA_TOPIC = "topic"
METADATA_CHUNK_INDEX = "chunk_index"
METADATA_WORD_COUNT = "word_count"
