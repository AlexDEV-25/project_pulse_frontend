import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

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
