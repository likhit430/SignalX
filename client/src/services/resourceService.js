import api from './api';

export const resourceService = {
  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return response.data;
  },
  getResources: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },
  getStatsSummary: async () => {
    const response = await api.get('/resources/stats/summary');
    return response.data;
  },
  getResource: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  updateResource: async (id, data) => {
    const response = await api.patch(`/resources/${id}`, data);
    return response.data;
  },
  updateAvailability: async (id, data) => {
    const response = await api.patch(`/resources/${id}/availability`, data);
    return response.data;
  },
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  }
};

export default resourceService;
