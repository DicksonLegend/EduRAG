# EduRAG Frontend

React SPA for the EduRAG offline adaptive learning system. Connects to the FastAPI backend for RAG-based Q&A, MCQ generation, document management, and progress tracking.

## Tech Stack

| Component | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Notifications | react-hot-toast |

## Setup

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → backend at localhost:8000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Dev server runs at `http://localhost:5173`. API requests are proxied to the backend automatically.

## Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/dashboard` | Dashboard | Document list, quick stats |
| `/upload` | Upload | PDF upload with processing status |
| `/ask` | Ask Question | RAG-based Q&A against uploaded documents |
| `/mcq` | MCQ Generator | Generate & take MCQs (Study/Practice modes) |
| `/analytics` | Analytics | Progress charts, scores, activity |
| `/history` | History | Past Q&A and MCQ attempts |

## Project Structure

```
src/
├── main.jsx                # Entry point
├── App.jsx                 # Router & layout
├── index.css               # Global styles (Tailwind)
├── api/
│   ├── axios.js            # Axios instance (base URL, auth interceptor)
│   ├── authApi.js          # Login / register
│   ├── documentApi.js      # Upload / list documents
│   ├── queryApi.js         # Ask questions
│   ├── mcqApi.js           # MCQ generate / submit
│   ├── historyApi.js       # Q&A & MCQ history
│   └── progressApi.js      # Progress & analytics data
├── components/
│   ├── Navbar.jsx          # Navigation bar
│   ├── ProtectedRoute.jsx  # Auth guard (redirects to /login)
│   ├── MCQCard.jsx         # MCQ question display card
│   └── Spinner.jsx         # Loading spinner
├── context/
│   └── AuthContext.jsx     # Auth state (JWT token, user info)
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── Upload.jsx
    ├── AskQuestion.jsx
    ├── MCQ.jsx
    ├── Analytics.jsx
    └── History.jsx
```

## API Proxy

Vite proxies `/api/*` requests to `http://localhost:8000` (stripping the `/api` prefix). This avoids CORS issues in development. In production, configure your reverse proxy (nginx/caddy) to route `/api` to the backend.

## Requirements

- Node.js 18+
- Backend running at `http://localhost:8000`
