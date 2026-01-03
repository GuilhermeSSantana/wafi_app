import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@types';

// Normalizar URL da API - remover barra final e garantir /api no final
const normalizeApiUrl = (url?: string): string => {
  const fallbackDev = 'http://localhost:3000';

  const raw =
    (url && url.trim()) ||
    (import.meta.env.DEV ? fallbackDev : '');

  if (!raw) {
    // Em produção, não deixa quebrar silencioso
    throw new Error(
      'VITE_API_URL não definida em produção. Configure no deploy (EasyPanel) e rebuilde o frontend.'
    );
  }

  // Remover barras finais
  let normalized = raw.replace(/\/+$/, '');

  // Garantir /api no final (sem duplicar)
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }

  return normalized;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro na requisição');
    }
    return response.data.data as T;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro na requisição');
    }
    return response.data.data as T;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro na requisição');
    }
    return response.data.data as T;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro na requisição');
    }
    return response.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro na requisição');
    }
    return response.data.data as T;
  }
}

export const api = new ApiService();
