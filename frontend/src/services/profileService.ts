import { apiService } from './api';
import { User } from '../types';

class ProfileService {
  async getProfile() {
    const response = await apiService.get<{ user: User }>('/profile');
    return response;
  }

  async updateProfile(data: {
    name: string;
    email: string;
    profile_photo?: File;
  }) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.profile_photo) {
      formData.append('profile_photo', data.profile_photo);
    }

    const response = await apiService.post<{ user: User; message: string }>(
      '/profile/update',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await apiService.post<{ message: string }>(
      '/profile/change-password',
      data
    );
    return response;
  }
}

export const profileService = new ProfileService();
