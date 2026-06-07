import { QueryClient } from '@tanstack/react-query';

function responseStatus(error: unknown) {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined;
  const response = error.response;
  if (!response || typeof response !== 'object' || !('status' in response)) return undefined;
  return typeof response.status === 'number' ? response.status : undefined;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: unknown) => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
        if (responseStatus(error) === 401) return false;
        return failureCount < 2;
      },
    },
  },
});
