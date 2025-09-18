import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({ baseURL: BASE_URL, withCredentials: true });

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function listProducts(params = {}) {
  const res = await client.get('/products', { params });
  return res.data;
}

export async function adminListProducts(params = {}) {
  const res = await client.get('/admin/products', { params, headers: authHeader() });
  return res.data;
}

export async function getProductBySku(sku) {
  const res = await client.get(`/products/${sku}`);
  return res.data;
}

export async function createProduct(payload) {
  const res = await client.post('/products', payload, { headers: authHeader() });
  return res.data;
}

export async function updateProduct(sku, payload) {
  const res = await client.patch(`/products/${sku}`, payload, { headers: authHeader() });
  return res.data;
}

export async function deleteProduct(sku) {
  const res = await client.delete(`/products/${sku}`, { headers: authHeader() });
  return res.data;
}

export async function toggleProductVisibility(sku) {
  const res = await client.post(`/products/${sku}/toggle`, {}, { headers: authHeader() });
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
