import { apiService } from './api';
import { CalendarDay } from '../types';

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
}

class CalendarService {
  async getMonth(month: string): Promise<CalendarDay[]> {
    const response = await apiService.get<LaravelApiResponse<CalendarDay[]>>(`/calendar?month=${month}`);
    return response?.data ?? [];
  }
}

export const calendarService = new CalendarService();
