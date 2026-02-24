from __future__ import annotations

"""
Smart overlapping text chunker with topic detection.
Splits extracted text into 400–600 word chunks with 100-word overlap.
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ── Topic Heading Detection ──────────────────────────────────────

# Patterns that typically indicate topic headings in academic PDFs
HEADING_PATTERNS = [
    # Numbered headings: "1. Introduction", "1.1 Background", "Chapter 1"
    re.compile(r'^(?:Chapter\s+)?\d+(?:\.\d+)*\.?\s+[A-Z][^\n]{3,80}$', re.MULTILINE),
    # ALL CAPS headings (at least 3 words)
    re.compile(r'^[A-Z][A-Z\s]{5,80}$', re.MULTILINE),
    # Title Case headings on their own line (heuristic)
    re.compile(r'^(?:[A-Z][a-z]+\s+){2,}[A-Z][a-z]+\s*$', re.MULTILINE),
]


def detect_topic_from_text(text: str) -> Optional[str]:
    """
    Attempt to detect a topic heading from the beginning of a text chunk.
    Returns the first heading found in the first 200 characters, or None.
    """
    search_region = text[:300]
    for pattern in HEADING_PATTERNS:
        match = pattern.search(search_region)
        if match:
            heading = match.group().strip()
            # Avoid very short or very long "headings"
            if 3 < len(heading) < 100:
                return heading
    return None


# ── Smart Chunker ────────────────────────────────────────────────

class SmartChunker:
    """
    Splits text into overlapping chunks suitable for embedding.

    Args:
        min_words: Minimum words per chunk (default 400).
        max_words: Maximum words per chunk (default 600).
        overlap_words: Number of overlapping words between chunks (default 100).
    """

    def __init__(
        self,
        min_words: int = 400,
        max_words: int = 600,
        overlap_words: int = 100,
    ):
        self.min_words = min_words
        self.max_words = max_words
        self.overlap_words = overlap_words

    def chunk_pages(
        self,
        pages: list[dict],
        filename: str,
    ) -> list[dict]:
        """
        Chunk a list of page-extracted texts into overlapping chunks.

        Args:
            pages: List of {"page_number": int, "text": str} dicts.
            filename: Name of the source file for metadata.

        Returns:
            List of chunk dicts with text and metadata.
        """
        # Concatenate all pages, tracking page boundaries
        full_text = ""
        word_to_page: dict[int, int] = {}  # Maps word index to page number
        word_idx = 0

        for page in pages:
            words_in_page = page["text"].split()
            for _ in words_in_page:
                word_to_page[word_idx] = page["page_number"]
                word_idx += 1
            full_text += page["text"] + "\n\n"

        all_words = full_text.split()
        total_words = len(all_words)

        if total_words == 0:
            return []

        chunks = []
        chunk_index = 0
        start = 0

        while start < total_words:
            end = min(start + self.max_words, total_words)

            # Try to break at a sentence boundary within the target range
            chunk_words = all_words[start:end]
            chunk_text = " ".join(chunk_words)

            # Find the last sentence boundary (., !, ?) within the chunk
            if end < total_words and len(chunk_words) >= self.min_words:
                last_period = chunk_text.rfind('. ')
                last_question = chunk_text.rfind('? ')
                last_exclaim = chunk_text.rfind('! ')
                last_boundary = max(last_period, last_question, last_exclaim)

                if last_boundary > 0:
                    # Count words up to that boundary
                    words_to_boundary = len(chunk_text[:last_boundary + 1].split())
                    if words_to_boundary >= self.min_words:
                        chunk_words = all_words[start:start + words_to_boundary]
                        chunk_text = " ".join(chunk_words)
                        end = start + words_to_boundary

            # Determine page number (majority page of the chunk)
            page_numbers = [
                word_to_page.get(i, pages[-1]["page_number"])
                for i in range(start, min(end, total_words))
            ]
            primary_page = max(set(page_numbers), key=page_numbers.count)

            # Detect topic from chunk text
            topic = detect_topic_from_text(chunk_text)

            chunk_data = {
                "text": chunk_text,
                "page_number": primary_page,
                "chunk_index": chunk_index,
                "topic": topic,
                "word_count": len(chunk_words),
                "filename": filename,
            }
            chunks.append(chunk_data)
            chunk_index += 1

            # Move start forward by (chunk_size - overlap)
            step = max(len(chunk_words) - self.overlap_words, 1)
            start += step

        logger.info(
            f"Created {len(chunks)} chunks from '{filename}' "
            f"({total_words} total words)"
        )
        return chunks


def propagate_topics(chunks: list[dict]) -> list[dict]:
    """
    Forward-fill topic labels: if a chunk has no detected topic,
    inherit the most recent topic from a previous chunk.
    """
    current_topic = None
    for chunk in chunks:
        if chunk["topic"]:
            current_topic = chunk["topic"]
        else:
            chunk["topic"] = current_topic
    return chunks
