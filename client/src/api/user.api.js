import api from './axios.js';

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
};

export default userApi;
