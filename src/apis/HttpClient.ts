import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

type ErrorResponseBody = {
  message?: unknown;
  error?: unknown;
  errors?: unknown;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'
) => {
  if (axios.isAxiosError<ErrorResponseBody>(error)) {
    const body: unknown = error.response?.data;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
      const responseBody = body as ErrorResponseBody;
      if (
        typeof responseBody.message === 'string' &&
        responseBody.message.trim()
      ) {
        return responseBody.message;
      }
      if (typeof responseBody.error === 'string' && responseBody.error.trim()) {
        return responseBody.error;
      }
      if (Array.isArray(responseBody.errors)) {
        const messages = responseBody.errors.filter(
          (item): item is string =>
            typeof item === 'string' && item.trim().length > 0
        );
        if (messages.length > 0) return messages.join(', ');
      }
    }
    if (error.message) return error.message;
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/+$/, '').replace(
    /\/api$/i,
    ''
  ),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error)
);

export const httpGet = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => (await api.get<T>(url, config)).data;

export const httpPost = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => (await api.post<T>(url, body, config)).data;

export const httpPut = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => (await api.put<T>(url, body, config)).data;

export const httpPatch = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => (await api.patch<T>(url, body, config)).data;

export const httpDelete = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => (await api.delete<T>(url, config)).data;

export default api;
