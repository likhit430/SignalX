import api from './api';

export const aiService = {
  classifyEmergency: async (message) => {
    const response = await api.post('/ai/classify-emergency', { message });
    return response.data;
  },
};

export default aiService;
