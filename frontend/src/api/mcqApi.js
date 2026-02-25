import api from './axios';

/** Generate MCQ questions from a document — extended timeout for LLM processing */
export const generateMCQs = (data) => api.post('/mcq/generate', data, {
    timeout: 300000, // 5 min — LLM MCQ generation is slow on CPU
});

/** Submit practice-mode MCQ answers for evaluation */
export const submitMCQAnswers = (data) => api.post('/mcq/submit', data);
