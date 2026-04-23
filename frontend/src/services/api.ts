// frontend/src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://tracker.test/api';
const BACKEND_URL = 'http://tracker.test';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true,
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const isFormData =
          typeof FormData !== 'undefined' && config.data instanceof FormData;

        if (isFormData && config.headers) {
          delete config.headers['Content-Type'];
        }

        // Add token to headers
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        //console.log('API Response:', response.config.url, response.data);
        return response.data;
      },
      (error) => {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.config?.headers,
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get<any, T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post<any, T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put<any, T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.patch<any, T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete<any, T>(url, config);
  }

  async download(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    return this.api.get<any, Blob>(url, {
      ...config,
      responseType: 'blob',
    });
  }
}

export const apiService = new ApiService();
