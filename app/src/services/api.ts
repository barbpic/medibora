import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
};

// Patients API
export const patientsApi = {
  getAll: (params?: { search?: string; page?: number; per_page?: number }) =>
    api.get('/patients/', { params }),
  getById: (id: number) => api.get(`/patients/${id}`),
  create: (data: Partial<Patient>) => api.post('/patients/', data),
  update: (id: number, data: Partial<Patient>) => api.put(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
  search: (query: string) => api.get('/patients/search', { params: { q: query } }),
};

// Encounters API
export const encountersApi = {
  getAll: (params?: { patient_id?: number; page?: number; per_page?: number }) =>
    api.get('/encounters/', { params }),
  getById: (id: number) => api.get(`/encounters/${id}`),
  create: (data: Partial<Encounter>) => api.post('/encounters/', data),
  update: (id: number, data: Partial<Encounter>) => api.put(`/encounters/${id}`, data),
  delete: (id: number) => api.delete(`/encounters/${id}`),
  getPatientHistory: (patientId: number) => api.get(`/encounters/patient/${patientId}/history`),
};

// AI API
export const aiApi = {
  search: (query: string) => api.get('/ai/search', { params: { q: query } }),
  getRiskAssessment: (patientId: number) => api.get(`/ai/risk-assessment/${patientId}`),
  getAlerts: () => api.get('/ai/alerts'),
  getDiagnosisSuggestions: (symptoms: string[]) =>
    api.post('/ai/suggestions/diagnosis', { symptoms }),
  getDashboardStats: () => api.get('/ai/dashboard/stats'),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users/'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: Partial<User>) => api.post('/users/', data),
  update: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Audit API
export const auditApi = {
  getLogs: (params?: { user_id?: number; action?: string; page?: number; per_page?: number }) =>
    api.get('/audit/logs', { params }),
  getMyLogs: (params?: { page?: number; per_page?: number }) =>
    api.get('/audit/logs/my', { params }),
  getStats: () => api.get('/audit/stats'),
};

export default api;

// Import types
import type { Patient, Encounter, User } from '@/types';
