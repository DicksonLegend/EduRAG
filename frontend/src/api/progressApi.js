import api from './axios';

/** Get the student's learning progress overview */
export const getProgressOverview = () => api.get('/progress/overview');
