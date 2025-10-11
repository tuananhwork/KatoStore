import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function setStoredToken(token) {
  if (typeof window === 'undefined') return;
  // Prefer localStorage if currently set there, else sessionStorage
  if (localStorage.getItem('token')) {
    localStorage.setItem('token', token);
  } else if (sessionStorage.getItem('token')) {
    sessionStorage.setItem('token', token);
  } else {
    // Default to localStorage
    localStorage.setItem('token', token);
  }
}

// Request interceptor - automatically add auth header
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let pendingRequests = [];

function onRefreshed(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

async function refreshToken() {
  const res = await apiClient.post('/auth/refresh');
  const newToken = res.data?.accessToken;
  if (newToken) {
    setStoredToken(newToken);
  }
  return newToken;
}

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      try {
        isRefreshing = true;
        const newToken = await refreshToken();
        isRefreshing = false;
        onRefreshed(newToken);
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        isRefreshing = false;
        onRefreshed(null);
        // fallthrough to reject
      }
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
