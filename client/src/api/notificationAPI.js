import apiClient from './client';

const notificationAPI = {
  async getMy(params = {}) {
    const res = await apiClient.get('/notifications/my', { params });
    return res.data;
  },
  async markRead(id) {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  async listAll(params = {}) {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },
  // Open SSE stream (returns EventSource)
  openStream(token) {
    const envBase = import.meta.env.VITE_API_URL || '';
    const isAbsolute = /^https?:\/\//i.test(envBase);
    const base = isAbsolute ? envBase.replace(/\/$/, '') : `${window.location.origin}${envBase ? envBase : ''}`;
    const url = `${base}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    return es;
  },
};

export default notificationAPI;
