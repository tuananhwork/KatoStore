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

export const createOrder = async (payload) => {
  const res = await client.post('/orders', payload, { headers: authHeader() });
  return res.data;
};

export const getMyOrders = async () => {
  // Some servers expose GET /orders (user scope) instead of /orders/me
  const res = await client.get('/orders', { headers: authHeader() });
  return res.data;
};

export const getOrderById = async (orderId) => {
  const res = await client.get(`/orders/${orderId}`, { headers: authHeader() });
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await client.post(`/orders/${orderId}/cancel`, {}, { headers: authHeader() });
  return res.data;
};

// Admin
export const getAllOrders = async (params = {}) => {
  const res = await client.get('/admin/orders', { params, headers: authHeader() });
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await client.patch(`/admin/orders/${orderId}`, { status }, { headers: authHeader() });
  return res.data;
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
