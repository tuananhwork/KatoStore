import { useState, useCallback, useEffect } from 'react';
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
 * Hook for handling API calls with loading states and data parsing
 */
export const useApiState = (apiFunction, parser = (data) => data, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      const parsedData = parser(response);
      setData(parsedData);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, parser]);

  useEffect(() => {
    let isMounted = true;

    const executeFetch = async () => {
      await fetchData();
      if (!isMounted) {
        // Component unmounted, don't update state
        return;
      }
    };

    executeFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};
