import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - automatically add auth header
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors: let callers decide how to handle (no global toast/redirect)
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    // Handle 403 errors
    if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
      return Promise.reject(error);
    }

    // Handle 409 errors (conflict)
    if (error.response?.status === 409) {
      const message = error.response?.data?.message || 'Dữ liệu đã tồn tại';
      toast.error(message);
      return Promise.reject(error);
    }

    // Handle 500 errors
    if (error.response?.status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.message || 'Có lỗi xảy ra';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default apiClient;
