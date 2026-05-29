type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const response = (error as ApiError).response;
  const validationError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : undefined;
  return validationError ?? response?.data?.message ?? fallback;
}
