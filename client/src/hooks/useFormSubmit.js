import { useState, useCallback } from 'react';
import { handleError } from '../utils/toast';

export const useFormSubmit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async (submitFn, options = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await submitFn();
      if (options.onSuccess) options.onSuccess(result);
      return result;
    } catch (err) {
      const message = handleError(err, options.errorMessage);
      setError(message);
      if (options.onError) options.onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, submit, setError };
};
