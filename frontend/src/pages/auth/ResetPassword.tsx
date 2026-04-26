import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../../services/authService';
import { Alert } from '../../components/UI/Alert';
import {
  AuthPrimaryButton,
  AuthShell,
  FloatingInput,
  PasswordField,
} from '../../components/Auth/AuthShell';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

type ResetPasswordForm = yup.InferType<typeof schema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token = '' } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const emailFromQuery = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: emailFromQuery,
      password: '',
      password_confirmation: '',
    },
  });

  const hasValidLink = Boolean(token && emailFromQuery);

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      await authService.resetPassword({
        token,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      setSuccess('Password updated successfully.');
      window.setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle={(
        <>
          Remembered your password?
          {' '}
          <Link to="/login" className="font-semibold text-sky-300 transition hover:text-sky-200">
            Back to login
          </Link>
        </>
      )}
      footer="Choose a strong new password to secure your workspace."
    >
      {!hasValidLink ? <Alert variant="error" message="This reset link is invalid or incomplete." /> : null}
      {error ? <Alert variant="error" message={error} /> : null}
      {success ? <Alert variant="success" message={success} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-7">
        <FloatingInput
          label="Email Address"
          type="email"
          autoComplete="email"
          icon="email"
          error={errors.email?.message}
          disabled={!hasValidLink || isLoading}
          {...register('email')}
        />

        <PasswordField
          label="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={!hasValidLink || isLoading}
          {...register('password')}
        />

        <PasswordField
          label="Confirm Password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          disabled={!hasValidLink || isLoading}
          {...register('password_confirmation')}
        />

        <AuthPrimaryButton loading={isLoading}>
          Update Password
        </AuthPrimaryButton>
      </form>
    </AuthShell>
  );
};
