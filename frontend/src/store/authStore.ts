// frontend/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Methods
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      
      // Set both user and token
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        });
      },
      
      // Set only user
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        isInitialized: true 
      }),
      
      // Set only token
      setToken: (token) => {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
        set({ token });
      },
      
      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Set initialized state
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      
      // Logout
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      }),
    }
  )
);