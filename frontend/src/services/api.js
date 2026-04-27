import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updatePassword: (data) => api.put('/auth/password', data),
};

export const formService = {
    create: (data) => api.post('/forms', data),
    list: (params) => api.get('/forms', { params }),
    getOne: (id) => api.get(`/forms/${id}`),
    getById: (id) => api.get(`/forms/public/${id}`),
    // getUserForms removed as it was duplicate
    update: (id, data) => api.put(`/forms/${id}`, data),
    delete: (id) => api.delete(`/forms/${id}`),
};

export const responseService = {
    submit: (formId, data) => api.post(`/responses/${formId}`, data),
    list: (formId) => api.get(`/responses/${formId}`),
    delete: (id) => api.delete(`/responses/${id}`),
};

export default api;
