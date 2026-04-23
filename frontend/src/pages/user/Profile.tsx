import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
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
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

type ProfileForm = yup.InferType<typeof schema>;

const getProfileImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
  return `${baseUrl}/storage/${path}`;
};

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    getProfileImageUrl(user?.profile_photo_path)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      setIsLoading(true);
      const response = await profileService.updateProfile({
        name: data.name,
        email: data.email,
        profile_photo: selectedFile || undefined,
      });
      setUser(response.user);
      setPreviewUrl(getProfileImageUrl(response.user?.profile_photo_path));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(getProfileImageUrl(user?.profile_photo_path));
    reset();
  };

  const getInitials = () => {
    return user?.name?.trim().split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const Layout = user?.role === 'admin' ? AdminLayout : UserLayout;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Information Section */}
        <div className="bg-white shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            {!isEditing && (
              <Button onClick={() => { setIsEditing(true); reset(); }}>
                Edit Profile
              </Button>
            )}
          </div>

          <div className="lg:flex gap-8">
            {/* Left: Profile Image */}
            <div className="lg:w-1/3 flex flex-col items-center lg:items-start gap-4 mb-6 lg:mb-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="h-48 w-48 lg:h-48 lg:w-48 rounded-full object-cover ring-4 ring-gray-100 shadow-md"
                  onError={() => setPreviewUrl('')}
                />
              ) : (
                <div className="h-48 w-48 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl lg:text-2xl font-semibold ring-4 ring-gray-100 shadow-md">
                  {getInitials()}
                </div>
              )}
              {isEditing && (
                <div className="text-center lg:text-left">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    className="my-2"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500">Note: JPG, JPEG, PNG, GIF or WebP</p>
                </div>
              )}
            </div>

            {/* Right: Account Details */}
            <div className="lg:w-2/3 flex-1">
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Full Name:</p>
                    <p className="text-gray-900 font-semibold text-xl mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Email:</p>
                    <p className="text-gray-900 font-semibold text-lg mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Role:</p>
                    <p className="text-gray-900 font-semibold capitalize">{user?.role}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Full Name"
                    className=' max-w-lg'
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email"
                    className=' max-w-lg'
                    type="email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <div className="flex gap-4 pt-2">
                    <Button type="submit" isLoading={isLoading}>
                      Save Changes
                    </Button>
                    <Button variant="secondary" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
