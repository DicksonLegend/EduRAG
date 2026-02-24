# EduRAG — Offline Adaptive AI Personalized Learning & Evaluation System

A structured academic AI system with adaptive learning and evaluation capabilities, built entirely for offline use.

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Python 3.11 + FastAPI |
| Embedding | BAAI/bge-base-en-v1.5 |
| LLM | Mistral-7B-Instruct (4-bit GGUF) |
| LLM Runtime | llama-cpp-python (GPU) |
| Vector DB | FAISS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| OCR | Tesseract (scanned PDF fallback) |
| PDF | PyMuPDF (fitz) |

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env
# Edit .env with your settings

# 4. Download the Mistral-7B model (GGUF)
# Place in: models/mistral-7b-instruct-v0.2.Q4_K_M.gguf

# 5. Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit: `http://localhost:8000/docs`

## Architecture

```
app/
├── api/          # API routes & middleware
├── auth/         # JWT authentication
├── core/         # Config, constants, exceptions
├── db/           # Database models & repositories
├── rag/          # Text extraction, chunking, prompts, FAISS
├── schemas/      # Pydantic request/response models
└── services/     # Business logic layer
```

## Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register student/mentor |
| POST | `/auth/login` | Login & get JWT token |
| POST | `/documents/upload` | Upload & process PDF |
| POST | `/query/ask` | Ask a question (RAG) |
| POST | `/mcq/generate` | Generate MCQs |
| POST | `/mcq/submit` | Submit MCQ answers |
| GET | `/progress/overview` | Student progress |
| GET | `/mentor/students` | Mentor dashboard |
| POST | `/revision/generate` | Generate revision notes |
