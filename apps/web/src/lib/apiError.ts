type ApiError = {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: { message?: string; errors?: Record<string, string[] | string> };
  };
};

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const apiError = error as ApiError;
  const response = apiError.response;
  const firstValidationError = response?.data?.errors ? Object.values(response.data.errors)[0] : undefined;
  const validationError = Array.isArray(firstValidationError) ? firstValidationError[0] : firstValidationError;

  if (validationError) return validationError;

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Check your connection and try again.';
  }

  if (apiError.code === 'ECONNABORTED' || apiError.message?.toLowerCase().includes('timeout')) {
    return 'The request took too long. Check your connection and try again.';
  }

  if (!response) {
    return 'We could not reach Spektra. Check your connection and try again.';
  }

  const messageByStatus: Record<number, string> = {
    400: 'We could not process that request. Check the details and try again.',
    401: response.data?.message ?? 'Session expired. Please log in again.',
    403: 'You do not have access to do that.',
    404: 'We could not find what you were looking for.',
    409: 'This conflicts with existing data. Refresh and try again.',
    429: 'Too many attempts. Wait a moment and try again.',
    500: 'The server had a problem. Try again in a moment.',
  };

  return response.status ? messageByStatus[response.status] ?? response.data?.message ?? fallback : response.data?.message ?? fallback;
}
