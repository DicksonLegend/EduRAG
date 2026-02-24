"""
Security middleware — PDF validation, rate limiting placeholder.
"""

from fastapi import UploadFile, HTTPException, status

from app.config import settings

ALLOWED_CONTENT_TYPES = [
    "application/pdf",
]


async def validate_pdf_upload(file: UploadFile) -> bytes:
    """
    Validate an uploaded PDF file for:
    - Content type
    - File extension
    - File size
    - PDF magic bytes

    Returns the raw file content bytes.
    """
    # Check content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {file.content_type}. Only PDF files are allowed.",
        )

    # Check extension
    if file.filename and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a .pdf extension.",
        )

    # Read file content
    content = await file.read()

    # Check size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB} MB.",
        )

    # Validate PDF magic bytes (%PDF-)
    if not content[:5] == b"%PDF-":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File does not appear to be a valid PDF.",
        )

    return content
