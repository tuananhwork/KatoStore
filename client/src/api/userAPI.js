import apiClient from './client';

export const getProfile = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await apiClient.patch('/auth/me', payload);
  return res.data;
};

// Prefer using authAPI.changePassword instead; kept for backward compatibility
export const changePassword = async (payload) => {
  const res = await apiClient.post('/auth/change-password', payload);
  return res.data;
};

// Admin
export const getUsers = async (params = {}) => {
  const res = await apiClient.get('/admin/users', { params });
  return res.data;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
};
