// frontend/src/services/expenseService.ts
import { apiService } from './api';
import { Expense, ExpenseStats, ExpenseCategory, Budget } from '../types';

export interface ExpenseFilters {
  category_id?: number;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  amount_min?: number;
  amount_max?: number;
}

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ExpenseService {
  private normalizeExpense(expense: Expense): Expense {
    return {
      ...expense,
      amount: this.parseNumber(expense.amount),
      expense_date: expense.expense_date || '',
    };
  }

  private normalizeDailyBreakdown(value: any): Array<{ date: string; total: number }> {
    if (Array.isArray(value)) {
      return value.map((item) => ({
        date: item?.date || '',
        total: this.parseNumber(item?.total),
      }));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).map(([date, total]) => {
        if (total && typeof total === 'object') {
          return {
            date: (total as any).date || date,
            total: this.parseNumber((total as any).total),
          };
        }

        return {
          date,
          total: this.parseNumber(total),
        };
      });
    }

    return [];
  }

  private normalizeMonthlyBreakdown(value: any): Array<{ month: number; total: number }> {
    if (Array.isArray(value)) {
      return value.map((item) => ({
        month: Number(item?.month) || 0,
        total: this.parseNumber(item?.total),
      }));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).map(([month, total]) => {
        if (total && typeof total === 'object') {
          return {
            month: Number((total as any).month) || Number(month) || 0,
            total: this.parseNumber((total as any).total),
          };
        }

        return {
          month: Number(month) || 0,
          total: this.parseNumber(total),
        };
      });
    }

    return [];
  }

  private normalizeCollection<T>(value: any): T[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      return Object.values(value) as T[];
    }

    return [];
  }

  async getExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await apiService.get<LaravelApiResponse<any>>(`/expenses?${params}`);
      //console.log('getExpenses response:', response);
      
      // Handle Laravel API response structure: { success: true, data: [...] }
      if (response?.data) {
        if (Array.isArray(response.data)) {
          return response.data.map((expense: Expense) => this.normalizeExpense(expense));
        }
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data.map((expense: Expense) => this.normalizeExpense(expense));
        }
        if (response.data.expenses && Array.isArray(response.data.expenses)) {
          return response.data.expenses.map((expense: Expense) => this.normalizeExpense(expense));
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return [];
    }
  }

  async getExpense(id: number): Promise<Expense | null> {
    try {
      const response = await apiService.get<LaravelApiResponse<Expense>>(`/expenses/${id}`);
      ////console.log(`getExpense ${id} response:`, response);
      
      if (response?.data) {
        return this.normalizeExpense(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch expense ${id}:`, error);
      return null;
    }
  }

  async createExpense(data: FormData | Partial<Expense>): Promise<Expense | null> {
    try {
      //console.log('Creating expense with data:', data);
      const response = await apiService.post<LaravelApiResponse<Expense>>('/expenses', data);
      //console.log('createExpense response:', response);
      
      if (response?.data) {
        return this.normalizeExpense(response.data);
      }
      
      return null;
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      throw error;
    }
  }

  async updateExpense(id: number, data: FormData | Partial<Expense>): Promise<Expense | null> {
    try {
      //console.log(`Updating expense ${id} with data:`, data);
      const response = await apiService.put<LaravelApiResponse<Expense>>(`/expenses/${id}`, data);
      //console.log('updateExpense response:', response);
      
      if (response?.data) {
        return this.normalizeExpense(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to update expense ${id}:`, error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    try {
      //console.log(`Deleting expense ${id}`);
      const response = await apiService.delete<LaravelApiResponse<any>>(`/expenses/${id}`);
      //console.log('deleteExpense response:', response);
      return response?.success !== false;
    } catch (error) {
      console.error(`Failed to delete expense ${id}:`, error);
      throw error;
    }
  }

  async getExpenseStats(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ExpenseStats> {
    try {
      const response = await apiService.get<LaravelApiResponse<any>>(`/expenses-stats?period=${period}`);
      //console.log('getExpenseStats response:', response);
      
      if (response?.data) {
        return {
          total: this.parseNumber(response.data.total),
          by_category: this.normalizeCollection(response.data.by_category),
          by_payment_method: this.normalizeCollection(response.data.by_payment_method),
          daily_average: this.parseNumber(response.data.daily_average),
          daily_breakdown: this.normalizeDailyBreakdown(response.data.daily_breakdown),
          monthly_breakdown: this.normalizeMonthlyBreakdown(response.data.monthly_breakdown),
          budgets: this.normalizeCollection<Budget>(response.data.budgets),
        };
      }
      
      return {
        total: 0,
        by_category: [],
        by_payment_method: [],
        daily_average: 0,
        daily_breakdown: [],
        budgets: [],
      };
    } catch (error) {
      console.error('Failed to fetch expense stats:', error);
      return {
        total: 0,
        by_category: [],
        by_payment_method: [],
        daily_average: 0,
        daily_breakdown: [],
        budgets: [],
      };
    }
  }

  async getCategories(): Promise<ExpenseCategory[]> {
    try {
      const response = await apiService.get<LaravelApiResponse<ExpenseCategory[]>>('/expense-categories');
      //console.log('getCategories response:', response);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  async getExpensesByPeriod(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<Expense[]> {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const start = new Date(today);
    const end = new Date(today);

    if (period === 'daily') {
      return this.getExpenses({
        date_from: formatDate(start),
        date_to: formatDate(end),
      });
    }

    if (period === 'weekly') {
      const day = start.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diffToMonday);
      end.setDate(start.getDate() + 6);
    }

    if (period === 'monthly') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    }

    if (period === 'yearly') {
      start.setMonth(0, 1);
      end.setMonth(11, 31);
    }

    return this.getExpenses({
      date_from: formatDate(start),
      date_to: formatDate(end),
    });
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return Number(value) || 0;
  }
}

export const expenseService = new ExpenseService();
