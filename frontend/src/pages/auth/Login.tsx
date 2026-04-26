// frontend/src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Alert } from '../../components/UI/Alert';
import {
  AuthPrimaryButton,
  AuthShell,
  FloatingInput,
  PasswordField,
} from '../../components/Auth/AuthShell';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginForm = yup.InferType<typeof schema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore(); // Use setAuth instead of setUser
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      
      console.log('Login response:', response);
      
      // Handle different response structures
      let userData, token;
      
      if (response.data) {
        userData = response.data.user || response.data;
        token = response.data.token;
      } else {
        userData = response.user || response;
        token = response.token;
      }
      
      if (userData && token) {
        // Use setAuth to set both user and token
        setAuth(userData, token);
        navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setValue('email', 'admin@gmail.com');
      setValue('password', 'shimanto');
    } else {
      setValue('email', 'user@gmail.com');
      setValue('password', 'shimanto');
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle={
        <>
          Don't have an account?
          {' '}
          <Link to="/register" className="font-semibold text-sky-300 transition hover:text-sky-200">
            Create
          </Link>
        </>
      }
      footer={
        <>
          Need help accessing your account?
          {' '}
          <Link to="/forgot-password" className="font-semibold text-sky-300 transition hover:text-sky-200">
            Reset password
          </Link>
        </>
      }
    >
      {error ? <Alert variant="error" message={error} /> : null}

      <form className="mt-6 space-y-7" onSubmit={handleSubmit(onSubmit)}>
        <FloatingInput
          label="Email Address"
          type="email"
          autoComplete="email"
          icon="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => fillDemoCredentials('user')}
            className="rounded-full border border-white/15 px-3 py-1.5 text-slate-200 transition hover:border-sky-300/40 hover:bg-white/10"
          >
            Use demo user
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials('admin')}
            className="rounded-full border border-white/15 px-3 py-1.5 text-slate-200 transition hover:border-sky-300/40 hover:bg-white/10"
          >
            Use demo admin
          </button>
        </div> */}

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs text-slate-300 transition hover:text-white">
            Forgot password?
          </Link>
        </div>

        <AuthPrimaryButton loading={isLoading}>Sign In</AuthPrimaryButton>
      </form>
    </AuthShell>
  );
};
