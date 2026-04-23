import { apiService } from './api';
import { FeedbackMessage } from '../types';

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class FeedbackService {
  async sendFeedback(data: FormData | { subject: string; message: string }): Promise<FeedbackMessage | null> {
    const response = await apiService.post<LaravelApiResponse<FeedbackMessage>>('/feedback-messages', data);
    return response?.data ?? null;
  }
}

export const feedbackService = new FeedbackService();
