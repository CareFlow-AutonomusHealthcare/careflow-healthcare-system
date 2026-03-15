import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});

export const careflowAPI = {
  getPatientHistory: async (patientId, windowDays = 90) => {
    const response = await api.get(`/patients/${patientId}/history?window_days=${windowDays}`);
    return response.data;
  },
  triggerBatchScoring: async () => {
    const response = await api.post('/engine/batch-score');
    return response.data;
  },
  getPendingProposals: async () => {
    const response = await api.get('/proposals');
    return response.data;
  },
  submitDecision: async (proposalId, decisionData) => {
    const response = await api.post(`/proposals/${proposalId}/decide`, decisionData);
    return response.data;
  },
  getInventory: async () => {
    const response = await api.get('/context/inventory');
    return response.data;
  },
  getStaffing: async () => {
    const response = await api.get('/context/staffing');
    return response.data;
  }
};

export default api;
