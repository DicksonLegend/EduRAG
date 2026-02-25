import api from './axios';

/** Ask a RAG-powered question about a document */
export const askQuestion = (data) => api.post('/query/ask', data);
