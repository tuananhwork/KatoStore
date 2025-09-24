import apiClient from './client';

const cartAPI = {
  getMine: async () => {
    const res = await apiClient.get('/cart/mine');
    return res.data;
  },
  replace: async (items) => {
    const res = await apiClient.put('/cart', { items });
    return res.data;
  },
  addOrUpdateItem: async ({ sku, quantity = 1, color, size }) => {
    const res = await apiClient.post('/cart/items', { sku, quantity, color, size });
    return res.data;
  },
  updateQuantity: async (key, quantity) => {
    const res = await apiClient.patch(`/cart/items/${encodeURIComponent(key)}/quantity`, { quantity });
    return res.data;
  },
  removeItem: async (key) => {
    const res = await apiClient.delete(`/cart/items/${encodeURIComponent(key)}`);
    return res.data;
  },
  clear: async () => {
    const res = await apiClient.delete('/cart');
    return res.data;
  },
};

export default cartAPI;
