# 🌌 EduRAG: Fully Offline AI-Powered Adaptive Learning & RAG Ecosystem

EduRAG is a state-of-the-art, fully offline-capable learning management and intelligence system. It brings together local Large Language Models (LLMs), highly optimized Retrieval-Augmented Generation (RAG) pipelines, and a futuristic, highly interactive React application to create an enclosed, private, and highly adaptive educational environment.

Unlike traditional cloud-dependent AI tools, EduRAG guarantees 100% data privacy by utilizing localized vector databases (FAISS) and quantized LLM execution (Mistral 7B GGUF), paired with a "Dark Glassmorphism" frontend built to maximize cognitive focus.

---

## 🏗️ System Architecture Overview

The EduRAG monorepo is divided into two primary engines: an asynchronous **FastAPI Python Backend** handling machine learning, RAG, and data orchestration, and a **React 19 SPA Frontend** delivering seamless, animated micro-interactions.

### 1. The Intelligence Engine (Backend)

The backend acts as the central brain of EduRAG. It manages API routing, authentication, and orchestrates the heavy machine learning workloads. Built on FastAPI, it delivers high-performance asynchronous operations critical for fluid AI streaming.

- **Framework:** FastAPI (Python 3.10+) 🐍
- **LLM Execution Environment:** `llama-cpp-python` (with optional, highly recommended CUDA/cuBLAS acceleration for extreme performance).
- **Core LLM Payload:** Mistral-7B-Instruct-v0.2 (Q4_K_M.gguf) running entirely locally without any external API calls.
- **Topographical Embeddings Engine:** `BAAI/bge-base-en-v1.5` mapping document chunk text into highly granular dense vectors.
- **Retrieval System (Vector DB):** FAISS (Facebook AI Similarity Search) maintaining lightning-fast localized flat indices (`.index` files) for O(1) semantic lookups.
- **Relational Database Management Layer:** SQLite/PostgreSQL managed via SQLAlchemy ORM, dynamically tracking User context, Document extraction metadata, QA History trails, generated MCQ attempts, and Topic progression telemetry.
- **Full RAG Pipeline Orchestration:** Automated PDF byte-level extraction -> semantic dynamic whitespace chunking -> vector space embedding -> cosine similarity topological search -> contextual prompt injection -> LLM generative output.

### 2. The Experience Layer (Frontend)

The frontend is an immersive user gateway carefully tuned to maximize user agency while maintaining absolute immersion in the learning workflow. It ignores default HTML native components in favor of custom-engineered interactions.

- **Framework ecosystem:** React 19 + Vite 7 ⚡
- **Aesthetics & Motion Physics:** Tailwind CSS v4 paired intimately with Framer Motion. Every component floats inside a dark thematic aesthetic (`#0A0F1C` background) using complex UI techniques such as stacked `backdrop-blur`, custom `z-index` layering matrices, and algorithmic spring physics.
- **Data Visualization Subsystem:** Recharts, driving the embedded "Learning Analytics" telemetry dashboard, utilizing rich SVG multi-stop linear gradients to construct beautiful dual-axis area and stacked bar charts.
- **Routing & Networking:** React Router v7 handling client-side SPA routing, bundled with deeply customized Axios interceptors engineered for secure, automatic JWT injection and un-authorized redirect logic spanning the `/api` reverse proxy.

---

## 🚦 Internal API Surface (FastAPI Endpoints)

The entire application communicates over a strictly typed REST architecture managed by Pydantic v2 schemas.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| POST | `/api/auth/register` | Creates a new secure User entity. | Hash rounds passwords via Bcrypt, returns User Object. |
| POST | `/api/auth/login` | Evaluates credentials and mints JWT. | Returns `{ access_token, token_type }` standard OAuth2. |
| GET | `/api/auth/me` | Validates active JWT against DB. | Requires Bearer Token. Returns decrypted UUID details. |

### Document Intelligence (`/api/documents`)
| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| POST | `/api/documents/upload` | Ingests PDF, chunks text, builds FAISS vectors. | Multipart form data -> FAISS `.index` + DB linking. |
| GET | `/api/documents/` | Retrieves user's knowledge base. | Returns array of ingested filenames, byte sizes, schemas. |
| DELETE | `/api/documents/{id}` | Purges Document + purges Vector `.index` file. | Absolute cascading deletion per user privacy protocol. |

### RAG & Query Network (`/api/query`)
| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| POST | `/api/query/ask` | Primary RAG LLM integration port. | `{"query": "...", "doc_ids": [...]}` -> Contextual answer. |
| POST | `/api/query/mentor`| Deep Socratic answering mode. | Reframes LLM persona to Ask questions instead of Answering. |

### MCQ Generation Pipeline (`/api/mcq`)
| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| POST | `/api/mcq/generate` | Invokes LLM into Zero-Shot generation mode. | `{doc_ids, difficulty, count}` -> Array of MCQ JSON objects. |
| POST | `/api/mcq/submit` | Verifies selected parameters and issues scoring. | Computes heuristics, scores telemetry, updates DB relations. |

### Telemetry & Progress (`/api/progress`)
| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| GET | `/api/progress/analytics` | Compiles raw telemetry into chart-ready structures. | Array of attempt scores, moving averages, relative dates. |
| GET | `/api/progress/topics` | Categorizes proficiency clustering by semantic topics. | Matrix representing subject-matter mastery constraints. |

---

## 🧬 Relational Database Topography (SQLAlchemy)

The application utilizes a heavy relational structure to maintain state continuity for the RAG engine. Below is the Entity Relationship schematic.

1. **User Model:** 
    - `id` (UUID, Primary Key)
    - `email`, `hashed_password`
    - Contains relationships to -> `documents`, `mcq_attempts`, `qa_history`, `progress`.
2. **Document Model:**
    - `id` (UUID), `user_id` (Foreign Key)
    - `filename`, `file_path`, `faiss_index_path`
    - `uploaded_at`, `status` (Processing, Available, Error).
    - Contains relationships to -> `chunks`.
3. **Chunk Model:**
    - `id`, `document_id` (FK)
    - `text_content` (Raw semantic string)
    - `chunk_index` (Sequential chronological marker)
    - `token_count` (Heuristic calculation).
4. **MCQ Attempt / QA History Models:**
    - `id`, `user_id` (FK)
    - `timestamp`, `question`, `provided_answer`, `correct_answer`, `llm_reasoning`
    - Essential for calculating the `Progress Model` telemetry matrix.

---

## 🧮 Vector Space & Embedding Mathematics

EduRAG avoids external embedding APIs, mapping human language directly into multidimensional space locally.

- **The Model:** `BAAI/bge-base-en-v1.5` translates chunks of textual semantic meaning into 768-dimensional floating-point vectors.
- **The Index:** FAISS leverages `IndexFlatL2` (L2 distance measuring / Euclidean geometry) or `IndexFlatIP` (Cosine Similarity) ensuring identical linguistic intents coalesce closely in the 768D plane.
- **The Retrieval Vector:** When a user asks "What is Mitochondrial division?", the question itself is converted into a 768D vector. The RAG pipeline performs a k-Nearest Neighbors (k-NN) search against the FAISS index, instantly retrieving the top `K=4` matching text chunks to form the LLM Context Window.

---

## 🚀 Deep Dive: Agentic Flows

### 📚 Private Knowledge Base Ingestion & Semantic Processing
Uploading a PDF to EduRAG isn't just saving a file—it kicks off a rigorous data processing workflow:
1. **Extraction:** PDF files are meticulously parsed (via PyPDF or PDFPlumber hooks within `text_extractor.py`), stripping formatting artifacts and isolating raw semantic payload.
2. **Semantic Chunking:** The `chunker.py` service algorithmically divides the extracted text into context-preserving overlapping chunks (e.g., 500-token blocks with a 50-token sliding window).
3. **Embedding Construction:** Each chunk is fed to the localized sentence-transformer, mapping language into a multi-dimensional array.
4. **FAISS Indexing:** The resulting vectors are statically committed to a rapid lookup index localized explicitly to that specific user/document relationship.
5. **No Data Leaks:** Zero bytes exist outside your drive.

### 🧠 Context-Aware Query Engine (The "Ask" Interface)
The primary RAG loop lives here. Ask any question bounded **only** by your uploaded syllabus or documents. The pipeline ensures the LLM minimizes hallucination by injecting the top-k FAISS results into a rigid system prompt template (`prompts.py`). 

**System Prompt Architecture Example:**
```text
You are an expert tutor. Use ONLY the provided context to answer the user's question.
If the answer is not contained in the context, say "I cannot determine this from the given materials." Do not hallucinate external facts.
Context:
{retrieved_chunks}
User Query: {question}
```

### 📝 Dynamic MCQ Generation & Cognitive Evaluation
Instead of drawing from static, pre-defined quiz banks, EduRAG dynamically generates real-time Multiple Choice Questions using advanced zero-shot prompt engineering. The system evaluates answers, delivers structured reasoning explaining *why* the chosen option was correct or incorrect, and immediately feeds the telemetry back to the database to calculate real-time proficiency scores.

### 📈 Deep Learning Telemetry & Progress Matrix
A dedicated Analytics engine continuously passively monitors user accuracy, historical answer latency, chronological history, and topic-specific mastery. Real-time data binds strictly to the `progress_service.py` to calculate overarching domain competency visualized perfectly by the Frontend's intricate Recharts implementation.

---

## 🎨 Global UI/UX Component Architecture (React 19)

The UI completely abandons standard HTML paradigms enforcing a rigid design-system protocol mapped in `Tailwind v4`.

### `AuthContext.jsx` (Global JWT Security Manager)
Monitors application-wide unauthenticated states. Functions as a Provider mapping User credentials into memory. Works in tandem with the `axios.js` interceptor which catches 401 Unauthorized responses to perform automatic cache purging and forced `/login` redirects.

### `CustomSelect.jsx` (Headless Framer Logic)
Standard `<select>` UI is unable to be properly CSS themed. EduRAG utilizes a custom ref-based component monitoring DOM `mousedown` outside boundaries to close un-selected windows while animating dropdown trays using `AnimatePresence`. 

### CSS Grid Orchestration
Glassmorphic cards utilize `Grid` over `Flexbox` for perfect two-dimensional layout rendering. Background `backdrop-blur-xl` combined with transparent `bg-gray-900/40` and SVG URL strokes creates the "holographic neon" signature.

---

## 🛠️ Local Setup & Initial Bootstrapping Guide

Given the intensive nature of local LLM and RAG pipelines, it's essential that the execution environment is properly leveled.

### Prerequisites (Hardware & Software)
- **Node.js** v18.0.0+ (for Vite frontend environment)
- **Python** 3.10+ (for API and ML workloads)
- **Minimum RAM:** 16GB (32GB recommended for large document RAG loops)
- **GPU (Optional but highly recommended):** NVIDIA GPU with 8GB+ VRAM

### Phase 1: Initialize the Intelligence Engine (Backend)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Construct and activate an isolated Python environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install standard requirements:
   ```bash
   pip install -r requirements.txt
   ```

#### ⚙️ CRITICAL: GPU Acceleration Configuration (Fixing CPU Fallback)
If you notice the application running slowly or falling back to CPU (a known issue when pulling standard pip packages), you must compile `llama-cpp-python` with CUDA/cuBLAS parameters explicitly.

1. Ensure the NVIDIA CUDA Toolkit is installed and paths are available.
2. Force uninstall the standard pip package:
   ```bash
   pip uninstall llama-cpp-python -y
   ```
3. Set the CMAKE flags to force cuBLAS compilation, and reinstall with the cache disabled:
   ```powershell
   # Windows PowerShell Execution:
   $env:CMAKE_ARGS="-DLLAMA_CUBLAS=on"
   $env:FORCE_CMAKE="1"
   pip install llama-cpp-python --upgrade --force-reinstall --no-cache-dir
   ```
   *(For Linux/macOS, use `CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python...`)*

4. Download the Model weights (if not present). Ensure `mistral-7b-instruct-v0.2.Q4_K_M.gguf` is placed perfectly in the root `/models/` directory.

5. Ignite the backend Uvicorn ASGI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Phase 2: Initialize the Experience Layer (Frontend)

1. Open a secondary terminal, maintaining backend execution in the primary terminal:
   ```bash
   cd frontend
   ```

2. Populate the React node dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite HMR server:
   ```bash
   npm run dev
   ```

Upon success, traverse to `http://localhost:5173`. 
*Note: Vite handles reverse connection proxying dynamically. Requests matching the `/api/*` descriptor are forwarded directly to `http://localhost:8000/api/*` immediately avoiding complex local CORS negotiations.*

---

## 📂 Monorepo Architectural Blueprint (Extensive)

The internal folder mapping structure is crucial to tracing workflow pipelines from DB abstraction to Component Rendering.

```text
EduRAG/
├── backend/                            # The Intelligence Engine (FastAPI)
│   ├── app/
│   │   ├── api/                        # Route Controllers (Auth, Documents, History, MCQ, Progress)
│   │   │   ├── deps.py                 # Dependency injectors (ex. DB Session, Auth Token decoder)
│   │   │   └── middleware/             # JWT Security & CORS intercept operations
│   │   ├── auth/                       # Encoding/Decoding JWT signatures (jwt_handler.py)
│   │   ├── core/                       # Global Constants, environment configs, and root Exceptions
│   │   ├── db/                         # Database connection context mapping
│   │   │   ├── database.py             # SQLAlchemy session generators
│   │   │   └── models/                 # Pure relational models (User, Document, Chunk, MCQ Attempt)
│   │   ├── rag/                        # The proprietary LLM/RAG workflow module
│   │   │   ├── chunker.py              # Logic dealing with structural NLP text division
│   │   │   ├── text_extractor.py       # High-fidelity document parsing
│   │   │   ├── vector_store.py         # FAISS operations abstractor
│   │   │   └── prompts.py              # Deeply engineered, precise system contextual prompts
│   │   ├── schemas/                    # Pydantic schemas standardizing strict API input/output validation
│   │   └── services/                   # Separation of concerns: Where actual computation exists beyond routing
│   │       ├── auth_service.py         # Handles hashing and verification protocols
│   │       ├── document_service.py     # Orchestrates DB + Uploaded File mapping
│   │       ├── retrieval_service.py    # Merges FAISS & Vector mapping logic
│   │       └── progress_service.py     # Real-time mathematical scoring matrix calculation
│   └── requirements.txt                # Fixed python environments payload details
├── frontend/                           # The Experience Layer (React + Vite)
│   ├── eslint.config.js                # Strict styling rules logic
│   ├── vite.config.js                  # HMR environment & API reverse proxy orchestrator
│   ├── index.html                      # App mount point & specialized EduRAG injected `<head>` UI mappings
│   ├── src/
│   │   ├── App.jsx                     # Top-level Routing grid & layout wrapper arrays
│   │   ├── main.jsx                    # Core DOM injector module integrating React trees
│   │   ├── index.css                   # Specialized Tailwind `@theme` directives defining the Glassmorphism
│   │   ├── api/                        # Dedicated API handlers (Separation of Network from UI logic)
│   │   │   └── axios.js                # Core Axios singleton featuring live token extraction techniques
│   │   ├── components/                 # Global UI element constructs
│   │   │   ├── ProtectedRoute.jsx      # Navigation boundary ensuring only validated JWT contexts exist
│   │   │   ├── CustomSelect.jsx        # Ref-based, animated dropdown built entirely ignoring HTML native rules
│   │   │   ├── MCQCard.jsx             # Highly customized, hover-responsive query display
│   │   │   └── Navbar.jsx              # Backdrop-blurred header component spanning all logged-in views
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # System-wide global state handling JWT validation boundaries
│   │   └── pages/                      # Specific view constructs mapped directly to URLs
│   │       ├── Dashboard.jsx
│   │       ├── Upload.jsx              
│   │       ├── AskQuestion.jsx         # Specialized RAG input streaming component area
│   │       ├── MCQ.jsx                 # AI Quiz interactive boundary
│   │       ├── Analytics.jsx           # Recharts-heavy visual data telemetry board
│   │       └── History.jsx             
│   └── public/
│       └── edurag.svg                  # Custom branded Vector application icon replacing Vite defaults
├── models/                             # Gigabyte-scale local ML inference weights
│   ├── mistral-7b-instruct-v0.2.Q4_K_M.gguf
│   └── huggingface/                    
│       └── models--BAAI--bge-base-en-v1.5/     # Cached topological text vectorization network
├── faiss_indices/                      # Highly volatile localized Vector databases
│   └── doc_X.index                     # Index created immediately upon user PDF submission
└── uploads/                            # Staging site for immediate local knowledge injection
```

---

## 🔒 Security & The Zero-Cloud Policy

EduRAG fundamentally rejects the cloud-first model required by generic models. By decoupling the architecture from centralized processing engines, EduRAG operates underneath an unbreachable **Zero-Cloud policy**. 

1. **Absolute Data Sovereignty:** Uploaded PDFs remain strictly upon localized mechanical storage arrays (`/uploads/`) and are never dispatched externally.
2. **Offline Embedding Generation:** Vectors mapping semantic language to numerical definitions are created utilizing localized cached HuggingFace mathematical networks without any callback requirements.
3. **Local Inference Domination:** Entirely contained CPU/GPU evaluation loops process context variables and system prompts into cohesive data responses. Zero interactions with OpenAI, Anthropic, or external providers guarantees you have supreme operational privacy control.
4. **Token Vault Security:** While offline, internal data bridges rely on hardened JWT (JSON Web Tokens) encoded with hashing metrics ensuring data isolation in localized shared area networks.

---

## 🚀 Future Deployments (Productionization)

While currently optimized for local desktop execution, scaling EduRAG for a multi-user institutional environment involves the following production guidelines:

1. **Gunicorn / Uvicorn Scaling:** Launching the FastAPI server utilizing worker processes scaling mathematically against available CPU core constraints.
2. **Reverse Proxy Ingress:** Configuring `NGINX` or `Caddy` utilizing port 80/443 to handle SSL offloading and automatically rerouting `/api` traffic downstream to the asynchronous python engines.
3. **Docker Compose Containment:** Wrapping the environment inside explicitly bounded `docker-compose.yaml` networks ensuring SQL instances, FAISS memory pools, and inference nodes communicate over isolated bridges, locking out external network access entirely.


---

## 🧠 Deep Inference: Quantization & Local LLM Mechanics

EduRAG achieves high-speed offline inference without enterprise-grade hardware by heavily utilizing **Quantization**.

### The Mistral-7B GGUF Profile
The system mandates `Mistral-7B-Instruct-v0.2.Q4_K_M.gguf`. 
- **Why GGUF?** GGUF (GPT-Generated Unified Format) is highly optimized for CPU/Apple Silicon/GPU-hybrid execution via `llama.cpp`. It allows the model to map directly into memory (mmap) providing near-instant load times.
- **Why Q4_K_M?** This refers to 4-bit quantization using "K-quants", specifically the "Medium" profile. A standard 7-Billion parameter model takes ~14GB of VRAM at 16-bit precision. The `Q4_K_M` profile mathematically compresses the network weights, dropping the memory footprint to ~4.8GB - 5.5GB while retaining 98% of the original cognitive reasoning capacity.
- **Context Window Orchestration:** EduRAG explicitly sets the `n_ctx` (Context Window) within the `llama-cpp-python` bindings to handle massive prompt injections. When 4 text chunks of 500 tokens each are retrieved via FAISS, the LLM requires at least a 4096-token native window to hold the system prompt, retrieval context, user query, and output stream without truncating memory.

## ✂️ The Mathematics of Semantic Chunking

Passing a 400-page PDF directly into an LLM is impossible. EduRAG employs a meticulous **Sliding Window Chunking** algorithm (`chunker.py`).

1. **Whitespace Normalization:** PDFs are notoriously dirty. The system strips excess line breaks, non-unicode bullet points, and ligatures.
2. **Dense Block Allocation:** Text is separated into strict sizes (e.g., 500 tokens per chunk).
3. **The Sliding Overlap Concept:** If a boundary cuts a sentence in half, semantic meaning dies. EduRAG utilizes a 10% overlap (e.g., 50 tokens). The end of Chunk A is duplicated as the beginning of Chunk B. When FAISS retrieves vectors, this ensures the LLM receives unbroken contextual thoughts, drastically reducing hallucination rates on complex topics like Medical Biology or Legal references.

---

## 🛡️ The Security Matrix: Authentication Lifecycle

To ensure strict multi-tenant privacy inside a local network, a full security barrier is implemented across both the FastAPI backend and React frontend.

### Backend Handshake (FastAPI + Bcrypt + JWT)
1. **Hashing:** Passwords never exist in plaintext. `auth_service.py` utilizes `passlib[bcrypt]` to hash passwords with salt before executing SQLAlchemy commits.
2. **Token Minting:** Upon `/api/auth/login`, a JSON Web Token (JWT) is minted utilizing the `HS256` algorithm, encoding the `sub` (User UUID) and an `exp` (Expiration timeline).
3. **Dependency Injection Guards:** `deps.py` provides an incredibly strict `get_current_user` FastAPI dependency. Every protected route mandates this dependency, instantly rejecting requests missing a valid Bearer token.

### Frontend Gatekeeping (Axios Interceptors + Context)
1. **Axios Interceptors:** Modifying API calls per-component is inefficient. `axios.js` deploys a global request interceptor. If `AuthContext` holds a token in standard memory/localStorage, it is automatically injected into the `Authorization: Bearer <token>` header of every outgoing `/api/` network ping.
2. **401 Catch-and-Purge:** A response interceptor watches for HTTP 401 (Unauthorized). If a token expires mid-session, the interceptor catches the crash, purges local storage, updates `AuthContext` to `null`, and force-redirects the DOM router tree to `/login`.

---

## 🌀 UI Physics & The Framer Motion Pipeline

EduRAG doesn't just display elements; it orchestrates them utilizing physical motion boundaries mapped via `framer-motion`.

1. **Algorithmic Springs:** Instead of rigid CSS `transitions`, modals and dropdowns (`CustomSelect.jsx`) are calculated via Spring physics. Setting `{ type: "spring", stiffness: 300, damping: 20 }` creates organic, tactile feedback perfectly mimicking physical resistance.
2. **DOM Unmounting (AnimatePresence):** React immediately destroys DOM nodes when state changes. `AnimatePresence` catches the unmount lifecycle, forcing React to pause destruction while `exit={{ opacity: 0, scale: 0.95 }}` animations execute, resolving jarring visual pop-ins/pop-outs.
3. **Glassmorphism Stacking:** The background layers are engineered via Tailwind CSS matrix stacking:
   - Base Layer: `#0A0F1C` (Deep void blue)
   - Middle Layer: Radial CSS gradients acting as "Neon Ambient Glows"
   - Foreground Layouts: `bg-slate-900/40 backdrop-blur-xl border-white/10`. This renders the card transluscent, letting the ambient glows warp and blur beneath the data tables and Recharts canvases.

## 🔮 Future Development Roadmap

- **Multi-Modal Document Parsing:** Adding Image and OCR extraction capabilities to the backend pipeline to handle scanned complex textbooks.
- **WebSocket Streaming Integrations:** Moving the Ask Question interface off standard HTTP resolving calls into raw bidirectional WebSocket channels for immediate, type-writer like UX responsiveness mimicking native LLM generation styling.
- **Agentic Refinement Loops:** Allowing the backend to generate subsequent RAG vector queries dynamically if the initial Top-K results do not satisfy internal confidence scoring boundaries.
- **Extended Theming Matrix:** Exposing core Tailwind CSS contextual variables via user settings.

> *"EduRAG is not just a tool; it is a declaration that the future of profound, high-level AI-driven education must run locally, adapt beautifully, and remain entirely private."*
