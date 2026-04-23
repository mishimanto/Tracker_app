import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { UserLayout } from '../../components/Layout/UserLayout';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import { profileService } from '../../services/profileService';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

const schema = yup.object({
  current_password: yup.string().required('Current password is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

type ChangePasswordForm = yup.InferType<typeof schema>;

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const Layout = user?.role === 'admin' ? AdminLayout : UserLayout;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      setIsLoading(true);
      await profileService.changePassword({
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success('Password changed successfully!');
      reset();
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              error={errors.current_password?.message}
              {...register('current_password')}
            />

            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              error={errors.password_confirmation?.message}
              {...register('password_confirmation')}
            />

            <div className="flex gap-4 pt-4 max-w-xl">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
              >
                Change Password
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/profile')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
