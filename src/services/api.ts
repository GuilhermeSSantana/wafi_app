import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@types';

// Normalizar URL da API - remover barra final e adicionar /api se necessário
const normalizeApiUrl = (url: string): string => {
  // Remover barras finais
  let normalized = url.replace(/\/+$/, '');
  
  // Se não termina com /api, adicionar
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return normalized;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

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

  // ✅ Novo método PATCH
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