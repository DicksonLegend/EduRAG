# EduRAG Backend

Offline RAG-based academic AI system — FastAPI backend with Mistral-7B LLM, FAISS vector search, and adaptive learning features.

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Python 3.9+ / FastAPI |
| LLM | Mistral-7B-Instruct (Q4_K_M GGUF) via llama-cpp-python |
| Embeddings | BAAI/bge-base-en-v1.5 (sentence-transformers) |
| Vector Store | FAISS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| PDF Extraction | PyMuPDF + Tesseract OCR fallback |
| Auth | JWT (python-jose + passlib/bcrypt) |

## Setup

```bash
# Create and activate venv
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

# Install base deps
pip install -r requirements.txt

# Install llama-cpp-python (choose one):
#   GPU (CUDA 12.4):
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124
#   CPU only:
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu

# Install PyTorch with CUDA (optional, for GPU embeddings):
pip install torch==2.5.1 --index-url https://download.pytorch.org/whl/cu124

# Configure
copy .env.example .env       # then edit .env

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The Mistral-7B model (~4.4 GB) auto-downloads from HuggingFace on first run.

## Environment Variables

Key settings in `.env` (see `.env.example` for full list):

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./edurag.db` | Database connection string |
| `JWT_SECRET_KEY` | — | **Change this** in production |
| `LLM_GPU_LAYERS` | `33` | Layers offloaded to GPU (0 = CPU only) |
| `LLM_THREADS` | `4` | CPU threads for inference |
| `LLM_CONTEXT_LENGTH` | `4096` | Max context window |
| `LLM_MAX_TOKENS` | `1024` | Max generation tokens |
| `FAISS_TOP_K` | `5` | Retrieved chunks per query |
| `CHUNK_MIN_WORDS` | `400` | Min words per chunk |
| `CHUNK_MAX_WORDS` | `600` | Max words per chunk |
| `TESSERACT_CMD` | `None` | Path to tesseract binary (if not in PATH) |

## API Endpoints

Swagger docs available at `http://localhost:8000/docs`

| Route | Description |
|---|---|
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login, returns JWT |
| `POST /documents/upload` | Upload & process PDF |
| `GET /documents/` | List user documents |
| `POST /query/ask` | Ask question (RAG) |
| `POST /mcq/generate` | Generate MCQs from document |
| `POST /mcq/submit` | Submit practice MCQ answers |
| `GET /topics/{doc_id}` | List detected topics |
| `POST /revision/generate` | Generate revision notes |
| `GET /progress/overview` | Student progress stats |
| `GET /mentor/students` | Mentor dashboard |
| `GET /history/qa` | Q&A history |
| `GET /history/mcq` | MCQ history |

## Architecture

```
app/
├── main.py                 # FastAPI app, lifespan, CORS, routers
├── config.py               # Pydantic settings (.env loader)
├── api/
│   ├── routes/             # Endpoint handlers
│   │   ├── auth.py         # Register / login
│   │   ├── documents.py    # Upload / list / status
│   │   ├── query.py        # RAG question answering
│   │   ├── mcq.py          # MCQ generation & evaluation
│   │   ├── topics.py       # Topic-wise learning
│   │   ├── revision.py     # Revision note generation
│   │   ├── progress.py     # Student analytics
│   │   ├── mentor.py       # Mentor dashboard
│   │   └── history.py      # Q&A and MCQ history
│   └── middleware/
│       └── security.py     # File upload validation
├── auth/
│   └── jwt_handler.py      # JWT encode/decode
├── core/
│   ├── constants.py        # Enums (doc status, MCQ modes, etc.)
│   └── exceptions.py       # Custom exceptions
├── db/
│   ├── database.py         # SQLAlchemy engine & session
│   ├── models/             # ORM models (user, document, chunk, etc.)
│   └── repositories/       # Data access layer
├── rag/
│   ├── text_extractor.py   # PyMuPDF + OCR extraction
│   ├── chunker.py          # Smart overlapping chunker + topic detection
│   ├── vector_store.py     # FAISS index management
│   └── prompts.py          # LLM prompt templates
├── schemas/                # Pydantic request/response models
└── services/
    ├── auth_service.py     # User registration & login
    ├── document_service.py # Full PDF processing pipeline
    ├── embedding_service.py# bge-base-en-v1.5 embeddings
    ├── generation_service.py # Mistral-7B inference (GPU/CPU)
    ├── retrieval_service.py# FAISS search + chunk retrieval
    ├── rag_service.py      # Orchestrates retrieval + generation
    ├── mcq_service.py      # MCQ generation & scoring
    ├── topic_service.py    # Topic management
    ├── revision_service.py # Revision note generation
    └── progress_service.py # Analytics & progress tracking
```

## Processing Pipeline

```
PDF Upload → Text Extraction (PyMuPDF/OCR) → Smart Chunking (400-600 words, overlapping)
→ Embedding (bge-base-en-v1.5) → FAISS Indexing → SQLite Storage
```

## GPU Notes

- **LLM**: Set `LLM_GPU_LAYERS` based on available VRAM. For 6GB GPU: ~20 layers. For 8GB+: 33 (all layers).
- **Embeddings**: Run on CPU by default to reserve VRAM for LLM.
- If GPU loading fails, the system auto-retries with fewer layers and falls back to CPU as last resort.
