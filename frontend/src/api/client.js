import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

// Restore token on page load
const token = localStorage.getItem('cf_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const careflowAPI = {
  // Auth
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  getMe: () => api.get('/auth/me'),

  // Patients
  listPatients: () => api.get('/patients'),
  getPatientHistory: (patientId, windowDays = 90) =>
    api.get(`/patients/${patientId}/history?window_days=${windowDays}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (patientId, data) => api.put(`/patients/${patientId}`, data),
  deletePatient: (patientId) => api.delete(`/patients/${patientId}`),

  // Risk Engine
  triggerBatchScoring: () => api.post('/engine/batch-score'),
  getPendingProposals: () => api.get('/proposals'),
  getAllProposals: () => api.get('/proposals/all'),
  submitDecision: (proposalId, decisionData) =>
    api.post(`/proposals/${proposalId}/decide`, decisionData),

  // Context
  getInventory: () => api.get('/context/inventory'),
  getStaffing: () => api.get('/context/staffing'),
  getDoctors: () => api.get('/context/doctors'),
  getNursingStaff: () => api.get('/context/nursing-staff'),
  updateInventory: (itemId, quantity) =>
    api.put(`/context/inventory/${itemId}?quantity=${quantity}`),

  // Admin
  listUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  toggleUser: (userId) => api.patch(`/admin/users/${userId}/toggle`),
  getAuditLogs: (limit = 100) => api.get(`/admin/audit-logs?limit=${limit}`),
};

export default api;
