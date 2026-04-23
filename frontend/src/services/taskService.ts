// frontend/src/services/taskService.ts
import { apiService } from './api';
import { Task, TaskStats } from '../types';

export interface TaskFilters {
  status?: string;
  priority?: string;
  date?: string;
  search?: string;
}

const normalizeDate = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toISOString().split('T')[0];
};

const normalizeTime = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const timeMatch = value.match(/(\d{2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const normalizeTask = (task: Task): Task => ({
  ...task,
  due_date: normalizeDate(task.due_date),
  due_time: normalizeTime(task.due_time),
});

class TaskService {
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (!value || value === 'all') {
          return;
        }

        params.append(key, value);
      });
      
      const response = await apiService.get<any>(`/tasks?${params}`);

      if (response?.success && response.data) {
        if (Array.isArray(response.data)) {
          return response.data.map(normalizeTask);
        }
      }
      
      if (Array.isArray(response)) {
        return response.map(normalizeTask);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  async getTask(id: number): Promise<Task | null> {
    try {
      const response = await apiService.get<any>(`/tasks/${id}`);
      ////console.log(`Task ${id} response:`, response);
      
      if (response?.success && response.data) {
        return normalizeTask(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch task ${id}:`, error);
      return null;
    }
  }

  async createTask(data: Partial<Task>): Promise<Task | null> {
    try {
      ////console.log('Creating task with data:', data);
      
      // Map frontend field names to backend expected names
      const taskData = {
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'medium',
        due_date: data.due_date,
        due_time: data.due_time || null,
        status: data.status || 'pending',
        is_recurring: data.is_recurring || false,
        recurrence_pattern: data.recurrence_pattern || null,
      };
      
      const response = await apiService.post<any>('/tasks', taskData);
      ////console.log('Create task response:', response);
      
      if (response?.success && response.data) {
        return normalizeTask(response.data);
      }
      
      return null;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors.join(', '));
      }
      throw error;
    }
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | null> {
    try {
      ////console.log(`Updating task ${id} with:`, data);
      
      const response = await apiService.put<any>(`/tasks/${id}`, data);
      ////console.log('Update task response:', response);
      
      if (response?.success && response.data) {
        return normalizeTask(response.data);
      }
      
      return null;
    } catch (error: any) {
      console.error(`Failed to update task ${id}:`, error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors.join(', '));
      }
      throw error;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const response = await apiService.delete<any>(`/tasks/${id}`);
      ////console.log('Delete task response:', response);
      return response?.success || false;
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      throw error;
    }
  }

  async toggleTaskStatus(id: number): Promise<Task | null> {
    try {
      const response = await apiService.patch<any>(`/tasks/${id}/toggle-status`);
      ////console.log('Toggle status response:', response);
      
      if (response?.success && response.data) {
        return normalizeTask(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to toggle task ${id}:`, error);
      throw error;
    }
  }

  async getTaskStats(): Promise<TaskStats> {
    try {
      const response = await apiService.get<any>('/tasks-stats');
      ////console.log('Task stats response:', response);
      
      if (response?.success && response.data) {
        return {
          total: Number(response.data.total) || 0,
          completed: Number(response.data.completed) || 0,
          pending: Number(response.data.pending) || 0,
          overdue: Number(response.data.overdue) || 0,
          today: Number(response.data.today) || 0,
        };
      }
      
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        today: 0,
      };
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        today: 0,
      };
    }
  }
}

export const taskService = new TaskService();
