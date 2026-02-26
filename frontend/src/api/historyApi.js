import api from './axios';

/** Get Q&A history for the current user */
export const getQuestionHistory = (params) => api.get('/history/questions', { params });

/** Get MCQ history for the current user */
export const getMCQHistory = (params) => api.get('/history/mcqs', { params });
