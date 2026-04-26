// frontend/src/pages/auth/Register.tsx
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
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

type RegisterForm = yup.InferType<typeof schema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.register(data);
      
      console.log('Register response:', response);
      
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
        setAuth(userData, token);
        navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle={
        <>
        Already have an account?
          {' '}
          <Link to="/login" className="font-semibold text-sky-300 transition hover:text-sky-200">
            Sign In
          </Link>
        </>
      }
      footer={
        <>
          By continuing, you agree to use the workspace responsibly and keep your credentials secure.
        </>
      }
    >
      {error ? <Alert variant="error" message={error} /> : null}

      <form className="mt-6 space-y-7" onSubmit={handleSubmit(onSubmit)}>
        <FloatingInput
          label="Full Name"
          type="text"
          autoComplete="name"
          icon="user"
          error={errors.name?.message}
          {...register('name')}
        />

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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordField
          label="Confirm Password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <AuthPrimaryButton loading={isLoading}>Create Account</AuthPrimaryButton>
      </form>
    </AuthShell>
  );
};
