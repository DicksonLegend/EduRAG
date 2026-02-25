import api from './axios';

/** Upload a PDF document (multipart/form-data) */
export const uploadDocument = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 min for large PDFs
    });
};

/** List all documents for the current user */
export const listDocuments = () => api.get('/documents/');

/** Get processing status of a specific document */
export const getDocumentStatus = (documentId) => api.get(`/documents/${documentId}/status`);
