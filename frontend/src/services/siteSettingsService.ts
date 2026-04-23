import { apiService } from './api';
import { SiteSetting } from '../types';

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class SiteSettingsService {
  async getPublicSettings(): Promise<SiteSetting | null> {
    try {
      const response = await apiService.get<LaravelApiResponse<SiteSetting>>('/site-settings');
      return response?.data ?? null;
    } catch (error) {
      console.error('Failed to fetch public site settings:', error);
      return null;
    }
  }
}

export const siteSettingsService = new SiteSettingsService();
