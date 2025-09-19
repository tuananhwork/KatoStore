import apiClient from './client';

export const createOrder = async (payload) => {
  const res = await apiClient.post('/orders', payload);
  return res.data;
};

export const getMyOrders = async () => {
  const res = await apiClient.get('/orders');
  return res.data;
};

export const getOrderById = async (orderId) => {
  const res = await apiClient.get(`/orders/${orderId}`);
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await apiClient.post(`/orders/${orderId}/cancel`);
  return res.data;
};

// Admin
export const getAllOrders = async (params = {}) => {
  const res = await apiClient.get('/admin/orders', { params });
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await apiClient.patch(`/admin/orders/${orderId}`, { status });
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
