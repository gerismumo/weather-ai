import { AxiosError } from 'axios';

export async function apiHandler<T>(
  apiCall: Promise<any>,
): Promise<{ success: boolean; message: string; data: T | null }> {
  try {
    const response = await apiCall;
    return {
      success: true,
      message: response.data?.message,
      data: (response.data?.data as T) ?? (response.data as T) ?? null,
    };
  } catch (err: unknown) {
    let message = 'Unexpected error occurred';
    const error = err as AxiosError;

    // session expired
    if (error.response?.status === 401) {
      message = 'Session expired. Please login again.';

      window.location.href = '/';

      return { success: false, message, data: null };
    }

    // Other HTTP errors
    if (error.response) {
      message =
        (error.response.data as any)?.message || 'Request failed with an error';
    }

    // Network / no response
    else if (error.request) {
      message = 'Unable to reach the server. Please try again.';
    }

    return { success: false, message, data: null };
  }
}
