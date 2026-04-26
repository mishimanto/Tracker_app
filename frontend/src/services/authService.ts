// frontend/src/services/authService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mytracker.shimzo.online/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.mytracker.shimzo.online';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Extract CSRF token from cookies
const getCsrfTokenFromCookie = (): string | null => {
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Get CSRF token from backend
const getCsrfToken = async () => {
  try {
    await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    
    // Extract token from cookie and add to headers
    const token = getCsrfTokenFromCookie();
    if (token) {
      api.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
    
    return true;
  } catch (error) {
    console.error('CSRF token fetch failed:', error);
    return false;
  }
};

// Request interceptor
api.interceptors.request.use((config) => {
  // Add bearer token if exists
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add CSRF token from cookie for stateful requests
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  
  return config;
});

class AuthService {
  async login(data: { email: string; password: string }) {
    try {
      await getCsrfToken();
      
      const response = await api.post('/login', data);
      
      // Return standardized response
      return {
        success: true,
        data: response.data,
        user: response.data.user || response.data,
        token: response.data.token,
      };
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  }

  async register(data: any) {
    try {
      await getCsrfToken();
      
      const response = await api.post('/register', data);
      
      return {
        success: true,
        data: response.data,
        user: response.data.user || response.data,
        token: response.data.token,
      };
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getUser() {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      await getCsrfToken();
      
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw error;
    }
  }

  async resetPassword(data: any) {
    try {
      await getCsrfToken();
      
      const response = await api.post('/reset-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw error;
    }
  }
}

export const authService = new AuthService();