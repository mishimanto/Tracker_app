import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../../services/authService';
import { Alert } from '../../components/UI/Alert';
import {
  AuthPrimaryButton,
  AuthShell,
  FloatingInput,
} from '../../components/Auth/AuthShell';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

type ForgotPasswordForm = yup.InferType<typeof schema>;

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setSuccess('Check your email for password reset instructions');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password?"
      subtitle={
        <>
          
          {' '}
          <Link to="/login" className="font-semibold text-sky-300 transition hover:text-sky-200">
            Back to login
          </Link>
        </>
      }
      footer="We will send a secure reset link to your email address."
    >
      {error ? <Alert variant="error" message={error} /> : null}
      {success ? <Alert variant="success" message={success} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-7">
        <FloatingInput
          label="Email Address"
          type="email"
          autoComplete="email"
          icon="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthPrimaryButton loading={isLoading}>Send Reset Link</AuthPrimaryButton>
      </form>
    </AuthShell>
  );
};
