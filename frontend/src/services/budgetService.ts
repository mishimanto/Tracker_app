import { apiService } from './api';
import { Budget } from '../types';

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class BudgetService {
  async getBudgets(): Promise<Budget[]> {
    const response = await apiService.get<LaravelApiResponse<Budget[]>>('/budgets');
    return response?.data ?? [];
  }

  async saveBudgets(
    budgets: Array<Pick<Budget, 'category_id' | 'limit_amount'> & { period?: 'monthly' }>
  ): Promise<Budget[]> {
    const response = await apiService.post<LaravelApiResponse<Budget[]>>('/budgets', { budgets });
    return response?.data ?? [];
  }

  async deleteBudget(id: number): Promise<boolean> {
    const response = await apiService.delete<LaravelApiResponse<null>>(`/budgets/${id}`);
    return response.success;
  }
}

export const budgetService = new BudgetService();
