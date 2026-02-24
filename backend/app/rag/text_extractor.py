"""
PDF text extraction using PyMuPDF with Tesseract OCR fallback.
Handles both selectable-text PDFs and scanned/image-based PDFs.
"""

import logging
import re
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def _clean_text(text: str) -> str:
    """Normalize whitespace, remove control characters, and clean up artifacts."""
    # Remove null bytes and control characters (keep newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Normalize multiple spaces to single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Normalize multiple newlines to double newlines (paragraph breaks)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove leading/trailing whitespace per line
    text = '\n'.join(line.strip() for line in text.split('\n'))
    return text.strip()


def _extract_with_pymupdf(page: fitz.Page) -> str:
    """Extract selectable text from a PDF page using PyMuPDF."""
    text = page.get_text("text")
    return text.strip()


def _extract_with_ocr(page: fitz.Page, tesseract_cmd: Optional[str] = None) -> str:
    """
    Extract text from a PDF page using OCR (Tesseract).
    Renders the page as an image and runs OCR on it.
    """
    try:
        import pytesseract
        from PIL import Image
        import io

        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

        # Render page at 300 DPI for good OCR quality
        pix = page.get_pixmap(dpi=300)
        img_bytes = pix.tobytes("png")
        image = Image.open(io.BytesIO(img_bytes))

        text = pytesseract.image_to_string(image, lang='eng')
        return text.strip()

    except ImportError:
        logger.warning("pytesseract or Pillow not installed. OCR fallback unavailable.")
        return ""
    except Exception as e:
        logger.error(f"OCR extraction failed for page: {e}")
        return ""


def extract_text_from_pdf(
    pdf_path: str,
    tesseract_cmd: Optional[str] = None,
    min_text_length: int = 50,
) -> list[dict]:
    """
    Extract text from a PDF file, page by page.

    Strategy:
    1. Try PyMuPDF selectable text extraction first.
    2. If a page has very little selectable text (< min_text_length chars),
       fall back to Tesseract OCR.

    Args:
        pdf_path: Path to the PDF file.
        tesseract_cmd: Optional path to tesseract binary.
        min_text_length: Minimum chars to consider a page as having selectable text.

    Returns:
        List of dicts: [{"page_number": int, "text": str, "method": str}]
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    pages_data = []
    doc = fitz.open(str(pdf_path))

    try:
        for page_num in range(len(doc)):
            page = doc[page_num]

            # Step 1: Try PyMuPDF text extraction
            text = _extract_with_pymupdf(page)
            method = "pymupdf"

            # Step 2: If insufficient text, try OCR
            if len(text) < min_text_length:
                logger.info(
                    f"Page {page_num + 1}: Insufficient selectable text "
                    f"({len(text)} chars). Attempting OCR..."
                )
                ocr_text = _extract_with_ocr(page, tesseract_cmd)
                if len(ocr_text) > len(text):
                    text = ocr_text
                    method = "ocr"

            # Clean the extracted text
            cleaned = _clean_text(text)

            if cleaned:
                pages_data.append({
                    "page_number": page_num + 1,  # 1-indexed
                    "text": cleaned,
                    "method": method,
                })

        logger.info(
            f"Extracted text from {len(pages_data)}/{len(doc)} pages of '{pdf_path.name}'"
        )
    finally:
        doc.close()

    return pages_data
