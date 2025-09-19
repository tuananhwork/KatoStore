import apiClient from './client';

export const getProfile = async () => {
  const res = await apiClient.get('/users/me');
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await apiClient.put('/users/me', payload);
  return res.data;
};

export const changePassword = async (payload) => {
  const res = await apiClient.post('/users/change-password', payload);
  return res.data;
};

// Admin
export const getUsers = async (params = {}) => {
  const res = await apiClient.get('/admin/users', { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await apiClient.get(`/admin/users/${id}`);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await apiClient.put(`/admin/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await apiClient.delete(`/admin/users/${id}`);
  return res.data;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
