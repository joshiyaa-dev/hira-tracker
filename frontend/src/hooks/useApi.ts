import { useState, useCallback } from 'react';

interface UseApiOptions {
  retries?: number;
  retryDelay?: number; // ms
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type ApiCall<T> = () => Promise<{ data: T }>;

/**
 * Generic hook for API calls with built-in loading state,
 * error handling, and configurable retry mechanism.
 */
export function useApi<T>(
  options: UseApiOptions = {}
): [UseApiState<T>, (call: ApiCall<T>) => Promise<T | null>] {
  const { retries = 2, retryDelay = 1000 } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (call: ApiCall<T>): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await call();
          const result = response.data;
          setState({ data: result, loading: false, error: null });
          return result;
        } catch (err: any) {
          lastError = err;
          if (attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * (attempt + 1))
            );
          }
        }
      }

      const errorMessage =
        lastError?.response?.data?.error ||
        lastError?.message ||
        'An unexpected error occurred';

      setState({ data: null, loading: false, error: errorMessage });
      return null;
    },
    [retries, retryDelay]
  );

  return [state, execute];
}
