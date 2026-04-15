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

// Clinical Data API
export const clinicalApi = {
  getAllergies: (patientId: number) => api.get(`/clinical/${patientId}/allergies`),
  createAllergy: (patientId: number, data: any) => api.post(`/clinical/${patientId}/allergies`, data),
  
  getProblems: (patientId: number) => api.get(`/clinical/${patientId}/problems`),
  createProblem: (patientId: number, data: any) => api.post(`/clinical/${patientId}/problems`, data),
  
  getMedications: (patientId: number) => api.get(`/clinical/${patientId}/medications`),
  createMedication: (patientId: number, data: any) => api.post(`/clinical/${patientId}/medications`, data),
  
  getHistories: (patientId: number) => api.get(`/clinical/${patientId}/histories`),
  createHistory: (patientId: number, data: any) => api.post(`/clinical/${patientId}/histories`, data),
  
  getImmunizations: (patientId: number) => api.get(`/clinical/${patientId}/immunizations`),
  createImmunization: (patientId: number, data: any) => api.post(`/clinical/${patientId}/immunizations`, data),
  
  getAppointments: (patientId: number) => api.get(`/clinical/${patientId}/appointments`),
  createAppointment: (patientId: number, data: any) => api.post(`/clinical/${patientId}/appointments`, data),
  
  getLabResults: (patientId: number) => api.get(`/clinical/${patientId}/results`),
  createLabResult: (patientId: number, data: any) => api.post(`/clinical/${patientId}/results`, data),
  
  getAdmissions: (patientId: number) => api.get(`/clinical/${patientId}/admissions`),
  createAdmission: (patientId: number, data: any) => api.post(`/clinical/${patientId}/admissions`, data),
  
  getVitalSigns: (patientId: number) => api.get(`/clinical/${patientId}/vitals`),
  createVitalSigns: (patientId: number, data: any) => api.post(`/clinical/${patientId}/vitals`, data),
  
  getSBARs: (patientId: number) => api.get(`/clinical/${patientId}/sbar`),
  createSBAR: (patientId: number, data: any) => api.post(`/clinical/${patientId}/sbar`, data),
  
  getDocuments: (patientId: number) => api.get(`/clinical/${patientId}/documents`),
  createDocument: (patientId: number, data: any) => api.post(`/clinical/${patientId}/documents`, data),
  
  getTasks: (patientId: number) => api.get(`/clinical/${patientId}/tasks`),
  createTask: (patientId: number, data: any) => api.post(`/clinical/${patientId}/tasks`, data),
  updateTask: (patientId: number, taskId: number, data: any) => api.put(`/clinical/${patientId}/tasks/${taskId}`, data),
  
  getReports: (patientId: number) => api.get(`/clinical/${patientId}/reports`),
  createReport: (patientId: number, data: any) => api.post(`/clinical/${patientId}/reports`, data),
};

// AI API
export const aiApi = {
  search: (query: string) => api.get('/ai/search', { params: { q: query } }),
  getRiskAssessment: (patientId: number) => api.get(`/ai/risk-assessment/${patientId}`),
  getAlerts: () => api.get('/ai/alerts'),
  getDiagnosisSuggestions: (symptoms: string[]) =>
    api.post('/ai/suggestions/diagnosis', { symptoms }),
  getDashboardStats: () => api.get('/ai/dashboard/stats'),
  exportFHIR: (patientId: number) => api.get(`/ai/export/fhir/patient/${patientId}`),
  exportHL7: (patientId: number) => api.get(`/ai/export/hl7/patient/${patientId}`),
  exportFHIRBundle: (patientId: number) => api.get(`/ai/export/fhir/bundle/${patientId}`),
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
