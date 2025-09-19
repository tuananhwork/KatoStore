import { toast } from 'react-toastify';

/**
 * Centralized error handling utility
 */
export const handleApiError = (error, customMessage = null) => {
  // If it's already handled by interceptor, don't show toast again
  if (error.response?.status === 401 || error.response?.status === 403) {
    return;
  }

  let message = customMessage;

  if (!message) {
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    } else {
      message = 'Có lỗi xảy ra';
    }
  }

  toast.error(message);
  return message;
};

/**
 * Handle specific error types
 */
export const handleSpecificError = (error, context = '') => {
  const status = error.response?.status;

  switch (status) {
    case 400:
      return 'Dữ liệu không hợp lệ';
    case 404:
      return 'Không tìm thấy dữ liệu';
    case 409:
      return 'Dữ liệu đã tồn tại';
    case 422:
      return 'Dữ liệu không đúng định dạng';
    case 500:
      return 'Lỗi máy chủ';
    default:
      return context ? `${context} thất bại` : 'Có lỗi xảy ra';
  }
};

/**
 * Check if error is network related
 */
export const isNetworkError = (error) => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

/**
 * Check if error is timeout
 */
export const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED' || error.message.includes('timeout');
};
