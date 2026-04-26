// frontend/src/pages/user/Dashboard.tsx
import React, { Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../../components/Layout/UserLayout';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { PageLoader } from '../../components/UI/PageLoader';
import { taskService } from '../../services/taskService';
import { expenseService } from '../../services/expenseService';
import { useAuthStore } from '../../store/authStore';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ListBulletIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const ExpenseChart = lazy(async () => {
  const module = await import('../../components/Expenses/ExpenseChart');
  return { default: module.ExpenseChart };
});

const RecentActivity = lazy(async () => {
  const module = await import('../../components/Dashboard/RecentActivity');
  return { default: module.RecentActivity };
});

const SectionFallback: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex min-h-48 items-center justify-center border border-dashed border-slate-200 bg-slate-50/80">
    <PageLoader message={message} />
  </div>
);

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: taskStats, isLoading: taskStatsLoading } = useQuery({
    queryKey: ['task-stats'],
    queryFn: taskService.getTaskStats,
  });

  const { data: expenseStatsData, isLoading: expenseStatsLoading } = useQuery({
    queryKey: ['expense-stats', 'monthly'],
    queryFn: () => expenseService.getExpenseStats('monthly'),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', { limit: 5 }],
    queryFn: () => taskService.getTasks({}),
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', { limit: 5 }],
    queryFn: () => expenseService.getExpenses({}),
  });

  // Safely extract data with defaults
  const recentTasks = Array.isArray(tasksData) ? tasksData : [];
  const recentExpenses = Array.isArray(expensesData) ? expensesData : [];
  
  // Safely extract expense stats with number conversion
  const expenseStats = React.useMemo(() => {
    if (!expenseStatsData) {
      return {
        total: 0,
        daily_average: 0,
        daily_breakdown: [],
        by_category: [],
        by_payment_method: [],
      };
    }
    
    // Convert total to number
    const total = typeof expenseStatsData.total === 'string' 
      ? parseFloat(expenseStatsData.total) 
      : Number(expenseStatsData.total) || 0;
    
    const dailyAverage = typeof expenseStatsData.daily_average === 'string'
      ? parseFloat(expenseStatsData.daily_average)
      : Number(expenseStatsData.daily_average) || 0;

    const dailyBreakdown = Array.isArray(expenseStatsData.daily_breakdown)
      ? expenseStatsData.daily_breakdown
      : [];
    
    return {
      total,
      daily_average: dailyAverage,
      daily_breakdown: dailyBreakdown.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount: Number(item.total) || 0,
      })),
      by_category: Array.isArray(expenseStatsData.by_category) ? expenseStatsData.by_category : [],
      by_payment_method: Array.isArray(expenseStatsData.by_payment_method) ? expenseStatsData.by_payment_method : [],
    };
  }, [expenseStatsData]);

  const completionRate = taskStats ? Math.round(((taskStats.completed || 0) / (taskStats.total || 1)) * 100) : 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // // Loading state
  // if (taskStatsLoading || expenseStatsLoading) {
  //   return (
  //     <UserLayout>
  //       <PageLoader message="Loading your dashboard..." />
  //     </UserLayout>
  //   );
  // }

  return (
    <UserLayout>
      <div className="space-y-6">

        {/* Welcome Banner */}
        <section className="relative overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgOHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6bTAtOHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80 mb-3">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl sm:text-3xl mt-4">
                <span className="font-bold text-gray-300">{getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/tasks')}
                className="inline-flex items-center gap-2 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200 border border-white/10"
              >
                <ListBulletIcon className="h-4 w-4" />
                View Tasks
              </button>
              <button
                onClick={() => navigate('/expenses')}
                className="inline-flex items-center gap-2 bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                <PlusIcon className="h-4 w-4" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Completion progress bar */}
          <div className="relative mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-300">Task Completion</span>
              <span className="font-bold text-white">{completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Tasks"
              value={taskStats?.total || 0}
              icon={<ListBulletIcon className="h-5 w-5" />}
              color="blue"
            />
            <StatsCard
              title="Completed"
              value={taskStats?.completed || 0}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              color="green"
              subtitle={`${completionRate}% done`}
            />
            <StatsCard
              title="Pending"
              value={taskStats?.pending || 0}
              icon={<ClockIcon className="h-5 w-5" />}
              color="orange"
            />
            <StatsCard
              title="Overdue"
              value={taskStats?.overdue || 0}
              icon={<ExclamationCircleIcon className="h-5 w-5" />}
              color="red"
            />
          </div>
        </section>

        {/* Expense Overview Card */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="group border border-orange-200/60 bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-700">
                    Monthly Expenses
                  </p>
                </div>
                <div className="rounded-full bg-orange-500/10 p-2.5 text-orange-600 group-hover:scale-110 transition-transform">
                  <CurrencyDollarIcon className="h-5 w-5" />
                </div>
              </div>
              
              <p className="text-3xl font-bold text-orange-900">
                BDT {expenseStats.total.toFixed(2)}
              </p>
              
              {expenseStats.daily_average > 0 && (
                <h4 className="text-sm text-orange-800 mt-4">
                  Daily avg:<span className="font-semibold"> BDT {expenseStats.daily_average.toFixed(2)}</span>
                </h4>
              )}

              <button
                onClick={() => navigate('/expenses')}
                className="inline-flex items-center mt-2 gap-1 underline text-sm font-medium text-orange-700 hover:text-orange-900 transition-colors group/btn"
              >
                View Details
                {/* <ArrowRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" /> */}
              </button>
            </div>
          </div>

          {/* Expense Trend Chart */}
          <div className="lg:col-span-2 border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Monthly Trend</h3>
              <p className="mt-1 text-sm text-slate-500">
                Your spending pattern this month
              </p>
            </div>
            <Suspense fallback={<SectionFallback message="Loading chart..." />}>
              <ExpenseChart data={expenseStats.daily_breakdown} type="bar" />
            </Suspense>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <Suspense fallback={<SectionFallback message="Loading activity..." />}>
            <RecentActivity
              tasks={recentTasks.slice(0, 5)}
              expenses={recentExpenses.slice(0, 5)}
            />
          </Suspense>
        </section>
      </div>
    </UserLayout>
  );
};
