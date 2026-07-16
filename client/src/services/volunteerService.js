import api from './api';

export const volunteerService = {
  createOrUpdateProfile: async (data) => {
    const response = await api.post('/volunteers/profile', data);
    return response.data;
  },
  getVolunteers: async (params = {}) => {
    const response = await api.get('/volunteers', { params });
    return response.data;
  },
  getStatsSummary: async () => {
    const response = await api.get('/volunteers/stats/summary');
    return response.data;
  },
  getMyProfile: async () => {
    const response = await api.get('/volunteers/me');
    return response.data;
  },
  updateMyProfile: async (data) => {
    const response = await api.patch('/volunteers/me', data);
    return response.data;
  },
  updateAvailability: async (availability) => {
    const response = await api.patch('/volunteers/me/availability', { availability });
    return response.data;
  },
  assignVolunteer: async (volunteerId, emergencyId) => {
    const response = await api.post(`/volunteers/${volunteerId}/assign/${emergencyId}`);
    return response.data;
  },
  completeAssignment: async (volunteerId, emergencyId) => {
    const response = await api.patch(`/volunteers/${volunteerId}/complete/${emergencyId}`);
    return response.data;
  },
  unassignVolunteer: async (volunteerId, emergencyId) => {
    const response = await api.post(`/volunteers/${volunteerId}/unassign/${emergencyId}`);
    return response.data;
  },
  getVolunteer: async (id) => {
    const response = await api.get(`/volunteers/${id}`);
    return response.data;
  }
};

export default volunteerService;
