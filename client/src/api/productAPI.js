import apiClient from './client';

export async function listProducts(params = {}) {
  const res = await apiClient.get('/products', { params });
  return res.data;
}

export async function adminListProducts(params = {}) {
  const res = await apiClient.get('/admin/products', { params });
  return res.data;
}

export async function getProductBySku(sku) {
  const res = await apiClient.get(`/products/${sku}`);
  return res.data;
}

export async function createProduct(payload) {
  const res = await apiClient.post('/products', payload);
  return res.data;
}

export async function updateProduct(sku, payload) {
  const res = await apiClient.patch(`/products/${sku}`, payload);
  return res.data;
}

export async function deleteProduct(sku) {
  const res = await apiClient.delete(`/products/${sku}`);
  return res.data;
}

export async function toggleProductVisibility(sku) {
  const res = await apiClient.post(`/products/${sku}/toggle`);
  return res.data;
}

export default {
  listProducts,
  adminListProducts,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
};
