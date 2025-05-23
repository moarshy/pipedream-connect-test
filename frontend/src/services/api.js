import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Test if backend is running
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Generate connect token for a user
  createConnectToken: async (userId) => {
    const response = await api.post('/connect-token', {
      external_user_id: userId
    });
    return response.data;
  },

  // Get accounts for a user
  getAccounts: async (userId) => {
    const response = await api.get(`/accounts/${userId}`);
    return response.data;
  },

  // Make authenticated API request on behalf of user
  makeAuthenticatedRequest: async (accountId, endpoint, options = {}, userId) => {
    const response = await api.post(`/proxy/${accountId}`, {
      endpoint,
      method: options.method || 'GET',
      data: options.data || null,
      external_user_id: userId // Add user ID
    });
    return response.data;
  }
};