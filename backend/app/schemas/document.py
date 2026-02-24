"""
Pydantic schemas for document upload and management.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.constants import DocumentStatus


class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    status: DocumentStatus
    message: str


class DocumentResponse(BaseModel):
    id: int
    filename: str
    total_pages: int
    total_chunks: int
    status: DocumentStatus
    created_at: datetime
    processed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DocumentStatusResponse(BaseModel):
    id: int
    filename: str
    status: DocumentStatus
    total_pages: int
    total_chunks: int
    error_message: Optional[str]

    model_config = {"from_attributes": True}


class TopicResponse(BaseModel):
    id: int
    name: str
    page_start: Optional[int]
    page_end: Optional[int]
    chunk_count: int

    model_config = {"from_attributes": True}
