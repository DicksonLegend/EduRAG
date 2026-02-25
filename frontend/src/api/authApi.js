import api from './axios';

/** Register a new user account */
export const registerUser = (data) => api.post('/auth/register', data);

/** Login and receive JWT token */
export const loginUser = (data) => api.post('/auth/login', data);

/** Get the currently authenticated user's info */
export const getCurrentUser = () => api.get('/auth/me');
