import { useState, useCallback } from 'react';
import { useAuth } from './useAuth.jsx';

/**
 * Custom hook for API calls with error handling
 */
export const useApi = () => {
  const { handle401Error } = useAuth();
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(
    async (apiFunction, ...args) => {
      setLoading(true);
      try {
        const result = await apiFunction(...args);
        return result;
      } catch (error) {
        // Handle 401 errors
        if (error?.response?.status === 401) {
          handle401Error();
          throw error;
        }

        // Handle 409 errors (conflict)
        if (error?.response?.status === 409) {
          const message = error?.response?.data?.message || 'Dữ liệu đã tồn tại';
          throw new Error(message);
        }

        // Handle other errors
        const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [handle401Error]
  );

  return {
    apiCall,
    loading,
  };
};

/**
 * Hook for handling API responses with loading states
 */
export const useApiState = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
};
