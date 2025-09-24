import { toast } from 'react-toastify';

export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
};

/**
 * Smart error handler - avoids duplicate toasts
 * Skips statuses already handled by API interceptor
 */
export const handleError = (error, customMessage = null) => {
  // If already handled by interceptor, don't show toast
  if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 409) {
    return error?.response?.data?.message || customMessage;
  }

  const message = customMessage || error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
  showToast.error(message);
  return message;
};

/**
 * Handle specific error types with Vietnamese messages
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
