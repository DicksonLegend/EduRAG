from __future__ import annotations

"""
Prompt templates for the RAG pipeline.

All prompts enforce:
- Answer only from provided context
- No hallucination / no external knowledge
- Mode-adaptive formatting
- Mark-based length control
"""


# ══════════════════════════════════════════════════════════════════
# SYSTEM PROMPT BASE
# ══════════════════════════════════════════════════════════════════

SYSTEM_BASE = (
    "You are an academic AI assistant. You MUST answer ONLY using the provided context. "
    "If the context does not contain enough information to answer the question, "
    "respond with: 'The provided documents do not contain sufficient information to answer this question.' "
    "Do NOT use any external knowledge. Do NOT hallucinate or make assumptions beyond the context."
)

# ══════════════════════════════════════════════════════════════════
# EXPLANATION MODE PROMPTS
# ══════════════════════════════════════════════════════════════════

MODE_PROMPTS = {
    "beginner": (
        "Explain in simple, easy-to-understand language. "
        "Use short sentences. Avoid jargon. "
        "Give one small, relatable example if possible. "
        "Keep the explanation brief and beginner-friendly."
    ),
    "exam": (
        "Answer in a structured, exam-ready format. "
        "Use numbered points or bullet points. "
        "Highlight important **keywords** in bold. "
        "Be concise, precise, and to the point. "
        "Structure the answer as if writing for an exam paper."
    ),
    "detailed": (
        "Provide a thorough and comprehensive explanation. "
        "Use clear headings and sub-points. "
        "Include definitions, explanations, and examples where relevant. "
        "Go into depth while staying within the provided context."
    ),
}

# ══════════════════════════════════════════════════════════════════
# MARK-BASED LENGTH CONTROL
# ══════════════════════════════════════════════════════════════════

MARK_PROMPTS = {
    2: (
        "This is a 2-mark answer. "
        "Provide exactly 2–3 concise bullet points. "
        "Maximum 50 words total. Be very brief."
    ),
    3: (
        "This is a 3-mark answer. "
        "Provide 3–4 structured points with brief explanations. "
        "Maximum 80 words total."
    ),
    5: (
        "This is a 5-mark answer. "
        "Provide 5 well-structured points, each with a one-line explanation. "
        "Maximum 150 words total."
    ),
    10: (
        "This is a 10-mark answer. "
        "Provide a comprehensive answer with: "
        "- An introduction sentence "
        "- Multiple headings or sub-sections "
        "- Detailed explanation with bullet points under each heading "
        "- A concluding summary "
        "Maximum 300 words total."
    ),
}

# ══════════════════════════════════════════════════════════════════
# MCQ GENERATION PROMPTS
# ══════════════════════════════════════════════════════════════════

MCQ_GENERATION_PROMPT = (
    "Based ONLY on the provided context, generate {count} multiple-choice questions (MCQs). "
    "Each question must test understanding of the content.\n\n"
    "{difficulty_instruction}\n\n"
    "For EACH question, provide:\n"
    "1. The question text\n"
    "2. Four options labeled A, B, C, D\n"
    "3. The correct answer letter\n"
    "4. A brief explanation of why the correct answer is right\n\n"
    "Format your response as a valid JSON array with this structure:\n"
    "[\n"
    '  {{\n'
    '    "question": "...",\n'
    '    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},\n'
    '    "correct_answer": "A",\n'
    '    "explanation": "..."\n'
    '  }}\n'
    "]\n\n"
    "IMPORTANT: Generate ONLY from the context. Do NOT create questions about topics "
    "not covered in the provided text."
)

# Difficulty-specific MCQ instructions
DIFFICULTY_PROMPTS = {
    "easy": (
        "DIFFICULTY: EASY. "
        "Generate simple, factual recall questions. "
        "Questions should ask 'What is...', 'Which of the following...', or 'Name the...' style. "
        "Distractors (wrong options) should be clearly incorrect. "
        "Suitable for beginners revising basic concepts."
    ),
    "medium": (
        "DIFFICULTY: MEDIUM. "
        "Generate conceptual understanding questions. "
        "Questions should test comprehension: 'Why does...', 'How does... work', "
        "'What happens when...'. "
        "Distractors should be plausible but distinguishable with proper understanding."
    ),
    "hard": (
        "DIFFICULTY: HARD. "
        "Generate challenging application and analysis questions. "
        "Questions should require applying concepts to scenarios, comparing ideas, "
        "or combining multiple concepts. "
        "Distractors must be very plausible and tricky — requiring deep understanding to eliminate. "
        "Include questions like 'In scenario X, which approach...', 'What is the primary difference between...'"
    ),
}

# ══════════════════════════════════════════════════════════════════
# REVISION NOTES PROMPTS
# ══════════════════════════════════════════════════════════════════

REVISION_SUMMARY_PROMPT = (
    "Based ONLY on the provided context, generate comprehensive revision notes.\n\n"
    "Include the following sections in your response as a valid JSON object:\n\n"
    '{{\n'
    '  "summary_points": ["point1", "point2", ...],\n'
    '  "key_definitions": [{{"term": "...", "definition": "..."}}, ...],\n'
    '  "likely_exam_questions": [{{"question": "...", "suggested_marks": 5}}, ...]\n'
    '}}\n\n'
    "Guidelines:\n"
    "- Summary: 8–12 concise bullet points covering the major concepts\n"
    "- Definitions: Extract all key terms and their definitions\n"
    "- Exam questions: 5–8 likely exam questions with suggested mark allocations\n"
    "- Use ONLY information from the provided context"
)


# ══════════════════════════════════════════════════════════════════
# PROMPT BUILDER
# ══════════════════════════════════════════════════════════════════

def build_rag_prompt(
    question: str,
    context_chunks: list[str],
    mode: str = "detailed",
    marks: int | None = None,
) -> str:
    """
    Build the full prompt for the RAG pipeline.

    Args:
        question: The user's question.
        context_chunks: List of relevant text chunks from FAISS retrieval.
        mode: Explanation mode (beginner/exam/detailed).
        marks: Mark scheme (2/3/5/10) or None.

    Returns:
        Formatted prompt string for the LLM.
    """
    # Combine context
    context = "\n\n---\n\n".join(context_chunks)

    # Build instruction
    instructions = [SYSTEM_BASE]
    instructions.append(MODE_PROMPTS.get(mode, MODE_PROMPTS["detailed"]))
    if marks and marks in MARK_PROMPTS:
        instructions.append(MARK_PROMPTS[marks])

    system_instruction = " ".join(instructions)

    prompt = (
        f"[INST] {system_instruction}\n\n"
        f"### Context (from uploaded documents):\n{context}\n\n"
        f"### Question:\n{question}\n\n"
        f"### Answer:\n[/INST]"
    )

    return prompt


def build_mcq_prompt(context_chunks: list[str], count: int = 5, difficulty: str = "medium") -> str:
    """Build prompt for MCQ generation from context with difficulty level."""
    context = "\n\n---\n\n".join(context_chunks)
    difficulty_instruction = DIFFICULTY_PROMPTS.get(difficulty, DIFFICULTY_PROMPTS["medium"])
    instruction = MCQ_GENERATION_PROMPT.format(count=count, difficulty_instruction=difficulty_instruction)

    prompt = (
        f"[INST] {SYSTEM_BASE}\n\n"
        f"{instruction}\n\n"
        f"### Context:\n{context}\n\n"
        f"### Generated MCQs:\n[/INST]"
    )
    return prompt


def build_revision_prompt(context_chunks: list[str]) -> str:
    """Build prompt for revision notes generation."""
    context = "\n\n---\n\n".join(context_chunks)

    prompt = (
        f"[INST] {SYSTEM_BASE}\n\n"
        f"{REVISION_SUMMARY_PROMPT}\n\n"
        f"### Context:\n{context}\n\n"
        f"### Revision Notes:\n[/INST]"
    )
    return prompt
