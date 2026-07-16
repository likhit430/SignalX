import api from './api';

export const emergencyService = {
  getStatsSummary: async () => {
    const response = await api.get('/emergencies/stats/summary');
    return response.data;
  },
  getEmergencies: async () => {
    const response = await api.get('/emergencies');
    return response.data;
  },
  getEmergency: async (id) => {
    const response = await api.get(`/emergencies/${id}`);
    return response.data;
  },
  createEmergency: async (data) => {
    const response = await api.post('/emergencies', data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/emergencies/${id}/status`, { status });
    return response.data;
  },
  deleteEmergency: async (id) => {
    const response = await api.delete(`/emergencies/${id}`);
    return response.data;
  },
  allocateResource: async (emergencyId, resourceId, quantity) => {
    const response = await api.post(`/emergencies/${emergencyId}/allocate-resource`, { resourceId, quantity });
    return response.data;
  },
  removeResource: async (emergencyId, resourceId) => {
    const response = await api.delete(`/emergencies/${emergencyId}/remove-resource/${resourceId}`);
    return response.data;
  },
  assignVolunteer: async (emergencyId, volunteerId) => {
    const response = await api.post(`/emergencies/${emergencyId}/assign-volunteer`, { volunteerId });
    return response.data;
  },
  unassignVolunteer: async (emergencyId, volunteerId) => {
    const response = await api.delete(`/emergencies/${emergencyId}/unassign-volunteer/${volunteerId}`);
    return response.data;
  }
};

export default emergencyService;
