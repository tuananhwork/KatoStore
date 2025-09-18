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

export const login = async (credentials) => {
  const res = await client.post('/auth/login', credentials);
  return res.data;
};

export const register = async (payload) => {
  const res = await client.post('/auth/register', payload);
  return res.data;
};

export const getMe = async () => {
  const res = await client.get('/auth/me', { headers: authHeader() });
  return res.data;
};

export const logout = async () => {
  const res = await client.post('/auth/logout', {}, { headers: authHeader() });
  return res.data;
};

export const refreshToken = async () => {
  const res = await client.post('/auth/refresh');
  return res.data;
};

export default {
  login,
  register,
  getMe,
  logout,
  refreshToken,
};
