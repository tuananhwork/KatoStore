import apiClient from './client';

export const login = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
};

export const register = async (payload) => {
  const res = await apiClient.post('/auth/register', payload);
  return res.data;
};

export const refresh = async () => {
  const res = await apiClient.post('/auth/refresh');
  return res.data;
};

export const logout = async () => {
  const res = await apiClient.post('/auth/logout');
  return res.data;
};

const authAPI = {
  login,
  register,
  refresh,
  logout,
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

export default authAPI;
