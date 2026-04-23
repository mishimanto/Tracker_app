import { apiService } from './api';
import { User, Task, Note, Expense, SiteSetting, ExpenseCategory, FeedbackMessage } from '../types';

interface PaginatedResponse<T> {
  data: T[];
}

const extractCollection = <T>(payload?: T[] | PaginatedResponse<T>): T[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  totalExpenses: number;
  totalNotes?: number;
}

interface AdminOverview {
  stats: AdminStats;
  analytics: {
    total_monthly_expenses: number;
    top_spending_categories: Array<{
      category_id: number;
      total_amount: number;
      expense_count: number;
      category?: ExpenseCategory;
    }>;
    most_active_users: Array<{
      id: number;
      name: string;
      email: string;
      tasks_count: number;
      expenses_count: number;
      notes_count: number;
      activity_score: number;
    }>;
    pending_tasks: {
      count: number;
      total: number;
      percentage: number;
    };
  };
  recent_users: User[];
  recent_tasks: Task[];
  recent_expenses: Expense[];
  recent_notes: Note[];
  recent_activity_logs: ActivityLog[];
}

interface ActivityLog {
  id: number;
  actor_id: number | null;
  target_user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
  actor?: Pick<User, 'id' | 'name' | 'email'> | null;
  target_user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

interface AdminReports {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalExpenses: number;
  monthlyExpenses: number;
  avgExpensePerUser: number;
  top_users?: Array<User & { tasks_count?: number; expenses_sum_amount?: number }>;
}

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const extractTopUsers = (
  payload: unknown
): Array<User & { tasks_count?: number; expenses_sum_amount?: number }> => {
  return Array.isArray(payload) ? payload : [];
};

class AdminService {
  async getUsers() {
    try {
      const response = await apiService.get<LaravelApiResponse<User[]>>('/admin/users');
      console.log('getUsers response:', response);
      
      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  async getUserDetails(id: number) {
    try {
      const response = await apiService.get<LaravelApiResponse<User>>(`/admin/users/${id}`);
      console.log('getUserDetails response:', response);
      
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      return null;
    }
  }

  async updateUserStatus(id: number, status: 'active' | 'inactive' | 'banned') {
    try {
      const response = await apiService.put<LaravelApiResponse<User>>(`/admin/users/${id}/status`, { status });
      console.log('updateUserStatus response:', response);
      
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  async getAllTasks() {
    try {
      const response = await apiService.get<LaravelApiResponse<Task[] | PaginatedResponse<Task>>>('/admin/all-tasks');
      console.log('getAllTasks response:', response);
      
      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch all tasks:', error);
      return [];
    }
  }

  async getAllExpenses() {
    try {
      const response = await apiService.get<LaravelApiResponse<Expense[] | PaginatedResponse<Expense>>>('/admin/all-expenses');
      console.log('getAllExpenses response:', response);
      
      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch all expenses:', error);
      return [];
    }
  }

  async getSystemStats(): Promise<AdminStats> {
    try {
      const response = await apiService.get<LaravelApiResponse<AdminStats>>('/admin/system-stats');
      console.log('getSystemStats response:', response);
      
      if (response?.data) {
        return {
          totalUsers: Number((response.data as any).totalUsers) || 0,
          activeUsers: Number((response.data as any).activeUsers) || 0,
          totalTasks: Number((response.data as any).totalTasks) || 0,
          totalExpenses: Number((response.data as any).totalExpenses) || 0,
          totalNotes: Number((response.data as any).totalNotes) || 0,
        };
      }
      
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTasks: 0,
        totalExpenses: 0,
        totalNotes: 0,
      };
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTasks: 0,
        totalExpenses: 0,
        totalNotes: 0,
      };
    }
  }

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      const response = await apiService.get<LaravelApiResponse<ExpenseCategory[] | PaginatedResponse<ExpenseCategory>>>('/admin/expense-categories');
      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch expense categories:', error);
      return [];
    }
  }

  async createExpenseCategory(data: Pick<ExpenseCategory, 'name' | 'icon' | 'color'>): Promise<ExpenseCategory | null> {
    try {
      const response = await apiService.post<LaravelApiResponse<ExpenseCategory>>('/admin/expense-categories', data);
      return response?.data ?? null;
    } catch (error) {
      console.error('Failed to create expense category:', error);
      throw error;
    }
  }

  async updateExpenseCategory(
    id: number,
    data: Partial<Pick<ExpenseCategory, 'name' | 'icon' | 'color'>>
  ): Promise<ExpenseCategory | null> {
    try {
      const response = await apiService.put<LaravelApiResponse<ExpenseCategory>>(`/admin/expense-categories/${id}`, data);
      return response?.data ?? null;
    } catch (error) {
      console.error(`Failed to update expense category ${id}:`, error);
      throw error;
    }
  }

  async deleteExpenseCategory(id: number) {
    const response = await apiService.delete<LaravelApiResponse<null>>(`/admin/expense-categories/${id}`);
    return response?.success === true;
  }

  async getOverview(): Promise<AdminOverview> {
    try {
      const response = await apiService.get<LaravelApiResponse<AdminOverview>>('/admin/overview');

      if (response?.data) {
        return response.data;
      }

      return {
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalTasks: 0,
          totalExpenses: 0,
          totalNotes: 0,
        },
        analytics: {
          total_monthly_expenses: 0,
          top_spending_categories: [],
          most_active_users: [],
          pending_tasks: {
            count: 0,
            total: 0,
            percentage: 0,
          },
        },
        recent_users: [],
        recent_tasks: [],
        recent_expenses: [],
        recent_notes: [],
        recent_activity_logs: [],
      };
    } catch (error) {
      console.error('Failed to fetch admin overview:', error);
      return {
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalTasks: 0,
          totalExpenses: 0,
          totalNotes: 0,
        },
        analytics: {
          total_monthly_expenses: 0,
          top_spending_categories: [],
          most_active_users: [],
          pending_tasks: {
            count: 0,
            total: 0,
            percentage: 0,
          },
        },
        recent_users: [],
        recent_tasks: [],
        recent_expenses: [],
        recent_notes: [],
        recent_activity_logs: [],
      };
    }
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const response = await apiService.get<LaravelApiResponse<ActivityLog[] | PaginatedResponse<ActivityLog>>>('/admin/activity-logs');
      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return [];
    }
  }

  async getReports(): Promise<AdminReports> {
    try {
      const response = await apiService.get<LaravelApiResponse<AdminReports>>('/admin/reports');
      console.log('getReports response:', response);
      
      if (response?.data) {
        return {
          totalUsers: Number((response.data as any).totalUsers) || 0,
          activeUsers: Number((response.data as any).activeUsers) || 0,
          inactiveUsers: Number((response.data as any).inactiveUsers) || 0,
          totalTasks: Number((response.data as any).totalTasks) || 0,
          completedTasks: Number((response.data as any).completedTasks) || 0,
          pendingTasks: Number((response.data as any).pendingTasks) || 0,
          totalExpenses: Number((response.data as any).totalExpenses) || 0,
          monthlyExpenses: Number((response.data as any).monthlyExpenses) || 0,
          avgExpensePerUser: Number((response.data as any).avgExpensePerUser) || 0,
          top_users: extractTopUsers((response.data as any).top_users),
        };
      }
      
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalExpenses: 0,
        monthlyExpenses: 0,
        avgExpensePerUser: 0,
        top_users: [],
      };
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalExpenses: 0,
        monthlyExpenses: 0,
        avgExpensePerUser: 0,
        top_users: [],
      };
    }
  }

  async getAllNotes() {
    try {
      const response = await apiService.get<LaravelApiResponse<Note[] | PaginatedResponse<Note>>>('/admin/all-notes');

      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch all notes:', error);
      return [];
    }
  }

  async getFeedbackMessages(): Promise<FeedbackMessage[]> {
    try {
      const response = await apiService.get<LaravelApiResponse<FeedbackMessage[] | PaginatedResponse<FeedbackMessage>>>('/admin/feedback-messages');
      return extractCollection(response?.data);
    } catch (error) {
      console.error('Failed to fetch feedback messages:', error);
      return [];
    }
  }

  async getFeedbackMessage(id: number): Promise<FeedbackMessage | null> {
    try {
      const response = await apiService.get<LaravelApiResponse<FeedbackMessage>>(`/admin/feedback-messages/${id}`);
      return response?.data ?? null;
    } catch (error) {
      console.error(`Failed to fetch feedback message ${id}:`, error);
      return null;
    }
  }

  async replyToFeedback(id: number, message: string) {
    try {
      const response = await apiService.post<LaravelApiResponse<null>>(`/admin/feedback-messages/${id}/reply`, { message });
      return response?.success === true;
    } catch (error) {
      console.error(`Failed to reply to feedback ${id}:`, error);
      throw error;
    }
  }

  async updateTask(id: number, data: Partial<Pick<Task, 'status' | 'priority'>>) {
    const response = await apiService.patch<LaravelApiResponse<Task>>(`/admin/tasks/${id}`, data);
    return response?.data ?? null;
  }

  async deleteTask(id: number) {
    const response = await apiService.delete<LaravelApiResponse<null>>(`/admin/tasks/${id}`);
    return response?.success === true;
  }

  async deleteExpense(id: number) {
    const response = await apiService.delete<LaravelApiResponse<null>>(`/admin/expenses/${id}`);
    return response?.success === true;
  }

  async deleteNote(id: number) {
    const response = await apiService.delete<LaravelApiResponse<null>>(`/admin/notes/${id}`);
    return response?.success === true;
  }

  async downloadReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const blob = await apiService.download(`/admin/reports/export?period=${period}`);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `admin-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  async downloadUserReport(userId: number, period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const blob = await apiService.download(`/admin/users/${userId}/report/export?period=${period}`);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `user-report-${userId}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  async getSettings(): Promise<SiteSetting | null> {
    try {
      const response = await apiService.get<LaravelApiResponse<SiteSetting>>('/admin/settings');
      return response?.data ?? null;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return null;
    }
  }

  async updateSettings(data: SiteSetting | Omit<SiteSetting, 'id'> | FormData): Promise<SiteSetting | null> {
    try {
      const response =
        typeof FormData !== 'undefined' && data instanceof FormData
          ? await apiService.post<LaravelApiResponse<SiteSetting>>('/admin/settings', data)
          : await apiService.put<LaravelApiResponse<SiteSetting>>('/admin/settings', data);
      return response?.data ?? null;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
