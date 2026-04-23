// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'active' | 'inactive' | 'banned';
  email_verified_at: string | null;
  profile_photo_path?: string | null;
  created_at: string;
  updated_at: string;
  task_count?: number;
  expense_count?: number;
  note_count?: number;
  tasks_completed?: number;
  total_expenses?: number;
  recent_tasks?: Task[];
  recent_expenses?: Expense[];
  recent_notes?: Note[];
}

export interface Note {
  id: number;
  user_id?: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface SiteSetting {
  id: number;
  site_name: string;
  support_email: string | null;
  currency_code: string;
  allow_registration: boolean;
  maintenance_mode: boolean;
  report_footer: string | null;
  logo_path?: string | null;
  favicon_path?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
}

export interface FeedbackMessage {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  screenshot_path?: string | null;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AppNotification {
  id: string;
  type: string;
  read_at: string | null;
  created_at: string;
  data: {
    kind?: 'budget_exceeded' | 'task_deadline' | 'feedback_reply';
    title?: string;
    message?: string;
    subject?: string;
    task_id?: number;
    feedback_id?: number;
    category_id?: number;
    limit_amount?: number;
    spent_amount?: number;
  };
}

// Task Types
export interface Task {
  id: number;
  user_id: number;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  due_time: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  completed_at: string | null;
  reminder_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Expense Types
export interface ExpenseCategory {
  id: number;
  user_id?: number | null;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  expenses_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: number;
  user_id: number;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  category_id: number;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expense_date: string;
  payment_method: 'cash' | 'card' | 'bank' | 'mobile';
  receipt_image: string | null;
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_mime_type?: string | null;
  recurring_template_id?: number | null;
  is_auto_generated?: boolean;
  notes: string | null;
  budget_status?: {
    budget?: Budget;
    warning?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  category?: ExpenseCategory;
  limit_amount: number;
  period: 'monthly';
  spent_amount?: number;
  remaining_amount?: number;
  usage_percentage?: number;
  is_exceeded?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarDay {
  date: string;
  expense_total: number;
  expense_count: number;
  task_count: number;
  expenses: Expense[];
  tasks: Task[];
}

export interface GlobalSearchResult {
  expenses: Expense[];
  tasks: Task[];
}

// Stats Types
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  today: number;
}

export interface ExpenseStats {
  total: number;
  by_category: Array<{
    category_id: number;
    total: number;
    category: ExpenseCategory;
  }>;
  by_payment_method: Array<{
    payment_method: string;
    total: number;
  }>;
  daily_average: number;
  daily_breakdown?: Array<{
    date: string;
    total: number;
  }>;
  monthly_breakdown?: Array<{
    month: number;
    total: number;
  }>;
  budgets?: Budget[];
}

export interface DashboardStats {
  tasks: TaskStats;
  expenses: ExpenseStats;
  recent_tasks: Task[];
  recent_expenses: Expense[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
