import { apiService } from './api';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalExpenses: number;
  monthlyExpenses: number;
}

interface RecentActivity {
  id: number;
  type: 'task' | 'expense';
  title: string;
  description: string;
  timestamp: string;
}

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<LaravelApiResponse<any>>('/dashboard/stats');
      //console.log('getStats response:', response);
      
      // Handle different response structures
      if (response?.data) {
        const data = response.data;
        
        // Backend returns { tasks: {...}, expenses: {...}, ... }
        if (data.tasks && data.expenses) {
          return {
            totalTasks: Number(data.tasks?.total) || 0,
            completedTasks: Number(data.tasks?.completed) || 0,
            totalExpenses: Number(data.expenses?.total) || 0,
            monthlyExpenses: Number(data.expenses?.total) || 0,
          };
        }
        
        // Direct stats object (if structure changes in future)
        if (data.totalTasks !== undefined || data.total !== undefined) {
          return {
            totalTasks: Number(data.totalTasks || data.total) || 0,
            completedTasks: Number(data.completedTasks || data.completed) || 0,
            totalExpenses: Number(data.totalExpenses || 0) || 0,
            monthlyExpenses: Number(data.monthlyExpenses || 0) || 0,
          };
        }
      }
      
      // Fallback - return zeros
      console.warn('Unable to extract stats from response:', response);
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalExpenses: 0,
        monthlyExpenses: 0,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalExpenses: 0,
        monthlyExpenses: 0,
      };
    }
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await apiService.get<LaravelApiResponse<RecentActivity[]>>('/dashboard/recent-activities');
      console.log('getRecentActivities response:', response);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      return [];
    }
  }

  async downloadReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    format: 'pdf' | 'csv' | 'excel' = 'pdf'
  ): Promise<void> {
    const blob = await apiService.download(`/reports/export?period=${period}&format=${format}`);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const extension = format === 'excel' ? 'xls' : format;
    anchor.download = `activity-report-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const dashboardService = new DashboardService();
