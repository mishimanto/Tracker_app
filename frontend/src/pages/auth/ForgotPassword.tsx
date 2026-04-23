import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../../services/authService';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Alert } from '../../components/UI/Alert';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600 mb-6">Enter your email to receive password reset instructions</p>
        
        {error && <Alert variant="error" message={error} />}
        {success && <Alert variant="success" message={success} />}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="you@example.com"
          />
          
          <Button type="submit" loading={isLoading} fullWidth className="mt-6">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};
