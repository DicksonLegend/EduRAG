import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000, // 2 min — LLM generation can be slow
});

// ── Request interceptor: attach JWT automatically ────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('edurag_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: global 401 handling ────────────────────
// Tracks redirect state to prevent infinite redirect loops
let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem('edurag_token');
            localStorage.removeItem('edurag_user');

            // Small delay to prevent race conditions with multiple 401s
            setTimeout(() => {
                window.location.href = '/login';
                // Reset flag after navigation completes
                setTimeout(() => { isRedirecting = false; }, 1000);
            }, 100);
        }
        return Promise.reject(error);
    }
);

export default api;
