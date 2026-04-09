# 🌌 EduRAG: Next-Gen Adaptive Learning Interface

Welcome to the frontend repository for **EduRAG** — an AI-powered, RAG-driven educational platform. This React-based Single Page Application (SPA) serves as the visual and interactive core for the offline adaptive learning system. It connects to the FastAPI backend to deliver real-time PDF processing, Retrieval-Augmented Generation (RAG) Q&A, dynamic MCQ generation, and deep learning telemetry.

Built with a highly stylized **Dark Glassmorphism UI**, this application completely rethinks educational interfaces, prioritizing immersion, micro-interactions, and cognitive ease through spatial layout and fluid animations.

---

## 🚀 Key Innovations & Features

- **Immersive Glassmorphism UI:** Built from the ground up utilizing `backdrop-blur` utilities, semi-transparent panels, and neon accents against a `#0A0F1C` void-like typography palette.
- **Fluid Micro-Interactions:** Fully customized UI components (such as the headless `<CustomSelect>` dropdowns) powered by **Framer Motion** to ensure buttery-smooth entry/exit animations, hover states, and dynamic spring transitions.
- **RAG-Powered Q&A Workspace:** Ask complex questions constrained to your uploaded documents. Real-time streaming-like responses integrated directly into an interactive chat-like interface.
- **Dynamic MCQ Evaluation Hub:** Generate on-the-fly quizzes with adjustable intelligence modes and difficulty weights. Features fully custom animated selectors replacing generic HTML inputs.
- **Comprehensive Learning Analytics:** Recharts-driven telemetry dashboard visualizing user progress, accuracy rates, and engagement through stunning SVG gradient charts (`<ComposedChart>`, Area, Bar, and Line data integrations).
- **Secure Context State:** Robust JWT-based authentication cycle managed via `AuthContext.jsx` and Axios interceptors for seamless token injection and private route guarding (`<ProtectedRoute>`).

---

## 🛠️ Technological Vanguard

| Category | Technology | Purpose in Ecosystem |
|---|---|---|
| **Core Framework** | **React 19** | Ultra-efficient rendering and structured UI architecture. |
| **Build Engine** | **Vite 7** | Lightning-fast HMR and optimized production bundling. |
| **Aesthetic Core** | **Tailwind CSS v4** | Utility-first styling, custom glow effects, and responsive grids. |
| **Motion Physics** | **Framer Motion** | Complex UI orchestration, `AnimatePresence`, and layout transitions. |
| **Data Visualization**| **Recharts** | Interactive SVG-based data rendering for the Analytics suite. |
| **Routing Protocol** | **React Router v7** | Fluid client-side navigation and route parameterization. |
| **Network Layer** | **Axios** | Intercepted API communication with automatic auth headers. |
| **Iconography** | **Lucide React** | Consistent, scalable SVG iconography. |

---

## 📁 Architectural Topography

```text
src/
├── main.jsx                # Application bootstrapper and context provider injection
├── App.jsx                 # Main routing matrix and global layout shell
├── index.css               # Core Tailwind directives + global CSS reset
├── api/                    # Network layer: Encapsulated remote procedural calls
│   ├── axios.js            # Axios singleton with embedded JWT interceptors (Req/Res)
│   ├── authApi.js          # Credential verification & registration procedures
│   ├── documentApi.js      # Document upload streams and retrieval protocols
│   ├── queryApi.js         # RAG-based LLM interrogation endpoints
│   ├── mcqApi.js           # Quiz generation and attempt submission
│   ├── historyApi.js       # Activity ledger retrieval
│   └── progressApi.js      # Analytics telemetry data aggregation
├── components/             # Reusable Interface Artifacts
│   ├── Navbar.jsx          # Top-level glassmorphic navigation array
│   ├── ProtectedRoute.jsx  # Security wrapper blocking unauthorized traversal
│   ├── MCQCard.jsx         # Interactive examination module component
│   ├── CustomSelect.jsx    # Highly animated headless select input (Framer Motion)
│   └── Spinner.jsx         # Hardware-accelerated loading indicator
├── context/                # Global Application State
│   └── AuthContext.jsx     # Central nervous system for identity and session lifecycle
└── pages/                  # Major Route Views
    ├── Login.jsx           # Entry portal authentication
    ├── Register.jsx        # Genesis portal for new entities
    ├── Dashboard.jsx       # Command center and quick-glance statistics
    ├── Upload.jsx          # Ingestion engine for PDF knowledge bases
    ├── AskQuestion.jsx     # The RAG interrogation interface
    ├── MCQ.jsx             # Adaptive testing and evaluation interface
    ├── Analytics.jsx       # Deep data visualization and progression tracking
    └── History.jsx         # Chronological ledger of past interactions
```

---

## ⚙️ Network Proxying (Development)

To bypass CORS restrictions during development and emulate a single-origin production environment, the Vite configuration acts as a reverse proxy. 

Any request fired to `/api/*` is intelligently intercepted, stripped of the `/api` prefix, and tunneled directly to the FastAPI backend listening on `http://localhost:8000`. 
*Note: In a live production environment, this responsibility shifts to Nginx or Caddy to route traffic to the backend server.*

---

## 💻 Environment Initialization

### Prerequisites
- Node.js v18.0.0+ 
- NPM / Yarn / pnpm
- Valid EduRAG local backend instance running on port `8000`

### Boot Sequence

```bash
# 1. Install all dependencies from the registry
npm install

# 2. Ignite the Vite development server with proxy enabled
npm run dev
```

*The application will compile and become available at `http://localhost:5173`. Authentication and API requests will automatically bridge to the backend at port `8000`.*

### Deployment Compilation

```bash
# Compile and optimize the application into the /dist directory
npm run build

# Verify the local production build
npm run preview
```

## 🎨 UI/UX Philosophy

The EduRAG frontend is intentionally designed to decrease cognitive load while maximizing user engagement. Native HTML elements that break immersion (like `alert()`, standard `<select>`, or basic input borders) have been systematically eradicated. They are replaced by dynamic React state, interactive overlays, custom headless dropdowns, and deep atmospheric styling to keep the learner entirely focused within the "Flow" state of study.