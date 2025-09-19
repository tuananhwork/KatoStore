import apiClient from './client';

export const login = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
};

export const register = async (payload) => {
  const res = await apiClient.post('/auth/register', payload);
  return res.data;
};

export const requestRegisterOTP = async (email) => {
  const res = await apiClient.post('/auth/register/request-otp', { email });
  return res.data;
};

export const verifyRegisterOTP = async (payload) => {
  const res = await apiClient.post('/auth/register/verify-otp', payload);
  return res.data;
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

export const changePassword = async (payload) => {
  const res = await apiClient.post('/auth/change-password', payload);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await apiClient.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPasswordWithOTP = async (payload) => {
  const res = await apiClient.post('/auth/reset-password-otp', payload);
  return res.data;
};

export const logout = async () => {
  const res = await apiClient.post('/auth/logout');
  return res.data;
};

export const refreshToken = async () => {
  const res = await apiClient.post('/auth/refresh');
  return res.data;
};

export default {
  login,
  register,
  requestRegisterOTP,
  verifyRegisterOTP,
  getMe,
  changePassword,
  forgotPassword,
  resetPasswordWithOTP,
  logout,
  refreshToken,
};
