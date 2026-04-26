import React, { Suspense, lazy, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowUpIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { UserLayout } from '../../components/Layout/UserLayout';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { dashboardService } from '../../services/dashboardService';
import { expenseService } from '../../services/expenseService';
import { siteSettingsService } from '../../services/siteSettingsService';
import { PageLoader } from '../../components/UI/PageLoader';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const ExpenseChart = lazy(async () => {
  const module = await import('../../components/Expenses/ExpenseChart');
  return { default: module.ExpenseChart };
});

const ChartFallback: React.FC = () => (
  <div className="flex min-h-64 items-center justify-center border border-dashed border-slate-200 bg-slate-50/80">
    <PageLoader message="Loading chart..." />
  </div>
);

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');
  const [loadingType, setLoadingType] = useState<'pdf' | 'csv' | 'excel' | null>(null);

  const { data: stats, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', selectedPeriod],
    queryFn: () => expenseService.getExpensesByPeriod(selectedPeriod),
  });

  const { data: expenseStats } = useQuery({
    queryKey: ['expense-stats', selectedPeriod],
    queryFn: () => expenseService.getExpenseStats(selectedPeriod),
  });

  const periodLabels: Record<PeriodType, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
  };

  const handleDownload = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      setLoadingType(format);

      await dashboardService.downloadReport(selectedPeriod, format);

      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setLoadingType(null);
    }
  };

  const chartData = useMemo(() => {
    if (selectedPeriod === 'yearly') {
      return (
        expenseStats?.monthly_breakdown?.map((item) => ({
          name: new Date(2026, item.month - 1, 1).toLocaleString('default', { month: 'short' }),
          amount: Number(item.total) || 0,
        })) || []
      );
    }
    if (selectedPeriod === 'monthly') {
      return (
        expenseStats?.daily_breakdown?.map((item) => ({
          name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          amount: Number(item.total) || 0,
        })) || []
      );
    }
    return expenses.map((expense) => ({
      name: new Date(expense.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      amount: Number(expense.amount) || 0,
    }));
  }, [expenses, selectedPeriod, expenseStats]);

  const completionRate = stats
    ? Math.round(((stats.completedTasks || 0) / (stats.totalTasks || 1)) * 100)
    : 0;

  return (
    <UserLayout>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-600">
            Error loading reports. Please try again later.
          </div>
        )}

        {stats && (
          <>
            {/* Key Metrics — unified StatsCard */}
            <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Key Metrics</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={loadingType !== null || !stats}
                    className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loadingType === 'pdf' ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    )}
                    {loadingType === 'pdf' ? 'Generating...' : 'Report'}
                  </button>

                  <button
                    onClick={() => handleDownload('csv')}
                    disabled={loadingType !== null || !stats}
                    className="inline-flex items-center gap-2 bg-blue-300 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {loadingType === 'csv' ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
                    ) : (
                      'CSV'
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload('excel')}
                    disabled={loadingType !== null || !stats}
                    className="inline-flex items-center gap-2 bg-green-300 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {loadingType === 'excel' ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
                    ) : (
                      'Excel'
                    )}
                  </button>
                </div>                
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatsCard
                  title="Total Tasks"
                  value={stats.totalTasks || 0}
                  icon={<ArrowUpIcon className="h-5 w-5" />}
                  color="blue"
                />
                <StatsCard
                  title="Completed"
                  value={stats.completedTasks || 0}
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                  color="green"
                  subtitle={`${completionRate}% rate`}
                />
                <StatsCard
                  title="Total Expenses"
                  value={`BDT ${Number(stats.totalExpenses || 0).toFixed(0)}`}
                  icon={<CreditCardIcon className="h-5 w-5" />}
                  color="orange"
                />
                <StatsCard
                  title="Monthly Avg"
                  value={`BDT ${Number((stats.monthlyExpenses || 0) / 12).toFixed(0)}`}
                  icon={<CalendarIcon className="h-5 w-5" />}
                  color="purple"
                />
              </div>
            </section>

            {/* Expense Trends */}
            <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Expense Trends</h2>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as PeriodType[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${
                        selectedPeriod === period
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/40'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md'
                      }`}
                    >
                      {periodLabels[period]}
                    </button>
                  ))}
                </div>
              </div>
              <Suspense fallback={<ChartFallback />}>
                <ExpenseChart data={chartData} type="bar" />
              </Suspense>
            </section>

            {/* Category Breakdown */}
            {expenseStats?.by_category && expenseStats.by_category.length > 0 && (
              <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Expenses by Category</h2>
                <div className="space-y-3">
                  {expenseStats.by_category.slice(0, 5).map((item, index) => {
                    const percentage = ((item.total / (expenseStats.total || 1)) * 100).toFixed(1);
                    const categoryKey = item.category_id ?? item.category?.id ?? `report-category-${index}`;
                    return (
                      <div key={categoryKey} className="group rounded-lg border border-slate-200 p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-green-700"></div>
                            <span className="font-medium text-slate-900">{item.category?.name || 'Unknown'}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            BDT {Number(item.total).toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{percentage}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Task Summary */}
            <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Task Summary</h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-slate-900">Completion Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {stats.completedTasks || 0} of {stats.totalTasks || 0} tasks completed
                  </p>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-100 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">Pending Tasks</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {Math.max(0, (stats.totalTasks || 0) - (stats.completedTasks || 0))}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </UserLayout>
  );
};
