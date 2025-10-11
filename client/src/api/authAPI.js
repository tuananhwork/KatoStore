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

export const changePassword = async (payload) => {
  const res = await apiClient.post('/auth/change-password', payload);
  return res.data;
};

// OTP-based registration
export const requestRegisterOTP = async (email) => {
  const res = await apiClient.post('/auth/register/request-otp', { email });
  return res.data;
};

export const verifyRegisterOTP = async ({ name, email, password, otp, remember }) => {
  const res = await apiClient.post('/auth/register/verify-otp', { name, email, password, otp, remember });
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
  changePassword,
  requestRegisterOTP,
  verifyRegisterOTP,
};

export default authAPI;
