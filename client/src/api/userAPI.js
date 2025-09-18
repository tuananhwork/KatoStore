import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfile = async () => {
  const res = await client.get('/users/me', { headers: authHeader() });
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await client.put('/users/me', payload, { headers: authHeader() });
  return res.data;
};

export const changePassword = async (payload) => {
  const res = await client.post('/users/change-password', payload, { headers: authHeader() });
  return res.data;
};

// Admin
export const getUsers = async (params = {}) => {
  const res = await client.get('/admin/users', { params, headers: authHeader() });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await client.get(`/admin/users/${id}`, { headers: authHeader() });
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await client.put(`/admin/users/${id}`, payload, { headers: authHeader() });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await client.delete(`/admin/users/${id}`, { headers: authHeader() });
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
