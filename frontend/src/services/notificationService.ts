import { apiService } from './api';
import { AppNotification } from '../types';

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class NotificationService {
  async getNotifications(): Promise<AppNotification[]> {
    const response = await apiService.get<LaravelApiResponse<AppNotification[]>>('/notifications');
    return response?.data ?? [];
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<LaravelApiResponse<{ count: number }>>('/notifications/unread-count');
    return Number(response?.data?.count || 0);
  }

  async markAllRead(): Promise<void> {
    await apiService.post('/notifications/mark-all-read');
  }
}

export const notificationService = new NotificationService();
