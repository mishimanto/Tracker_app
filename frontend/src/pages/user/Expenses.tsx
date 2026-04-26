import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { UserLayout } from '../../components/Layout/UserLayout';
import { ExpenseChart } from '../../components/Expenses/ExpenseChart';
import { ExpenseStatCards } from '../../components/Expenses/ExpenseStatCards';
import { ExpenseList } from '../../components/Expenses/ExpenseList';
import { AddExpenseForm } from '../../components/Expenses/AddExpenseForm';
import { Modal } from '../../components/UI/Modal';
import { expenseService } from '../../services/expenseService';
import { budgetService } from '../../services/budgetService';
import toast from 'react-hot-toast';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [budgetDrafts, setBudgetDrafts] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', selectedPeriod],
    queryFn: () => expenseService.getExpensesByPeriod(selectedPeriod),
  });

  const { data: stats } = useQuery({
    queryKey: ['expense-stats', selectedPeriod],
    queryFn: () => expenseService.getExpenseStats(selectedPeriod),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getBudgets(),
  });

  const budgetPayload = useMemo(
    () =>
      (stats?.by_category || [])
        .map((item) => {
          const existingBudget = budgets.find((entry) => entry.category_id === item.category_id);
          const rawValue = budgetDrafts[item.category_id] ?? String(existingBudget?.limit_amount || '');
          const limitAmount = Number(rawValue);

          if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
            return null;
          }

          return {
            category_id: Number(item.category_id),
            limit_amount: limitAmount,
            period: 'monthly' as const,
          };
        })
        .filter((item): item is { category_id: number; limit_amount: number; period: 'monthly' } => item !== null),
    [budgetDrafts, budgets, stats?.by_category]
  );

  const saveBudgetsMutation = useMutation({
    mutationFn: () => {
      if (budgetPayload.length === 0) {
        throw new Error('Add at least one valid monthly budget before saving.');
      }

      return budgetService.saveBudgets(budgetPayload);
    },
    onSuccess: () => {
      toast.success('Budgets saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
    },
    onError: (error: any) => {
      const validationErrors = error?.response?.data?.errors;
      const firstValidationMessage =
        validationErrors && typeof validationErrors === 'object'
          ? Object.values(validationErrors).flat()[0]
          : null;

      toast.error(
        firstValidationMessage ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to save budgets.'
      );
    },
  });

  const periodLabels: Record<PeriodType, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
  };

  const chartData = useMemo(() => {
    if (selectedPeriod === 'yearly') {
      return (
        stats?.monthly_breakdown?.map((item) => ({
          name: new Date(2026, item.month - 1, 1).toLocaleString('default', {
            month: 'short',
          }),
          amount: Number(item.total) || 0,
        })) || []
      );
    }

    if (selectedPeriod === 'monthly') {
      return (
        stats?.daily_breakdown?.map((item) => ({
          name: new Date(item.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          amount: Number(item.total) || 0,
        })) || []
      );
    }

    return expenses.map((expense) => ({
      name: new Date(expense.expense_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      amount: Number(expense.amount) || 0,
    }));
  }, [expenses, selectedPeriod, stats]);

  return (
    <UserLayout>
      <div className="space-y-6">
        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {periodLabels[selectedPeriod]}'s expense overview
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {/* <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="col-span-2 inline-flex items-center justify-center gap-2 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/25 active:scale-95 sm:col-span-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Expense
                </button> */}

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

            <div className="grid grid-cols-1 gap-4">
              <ExpenseStatCards
                period={selectedPeriod}
                stats={{
                  total: stats?.total || 0,
                  entries: expenses.length,
                  average: expenses.length > 0 ? (stats?.total || 0) / expenses.length : 0,
                  topCategory: stats?.by_category?.[0]?.category?.name || 'No category',
                }}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Spending Trend</h3>
              </div>
              <ArrowDownIcon className="h-5 w-5 text-slate-300" />
            </div>
            <ExpenseChart data={chartData} type="bar" />
          </div>

          <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900">Summary</h3>

            <div className="mt-5 space-y-3">
              <div className="cursor-pointer bg-linear-to-br from-emerald-50 to-emerald-100 p-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="text-xs font-semibold text-emerald-700">Total Spent</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">
                  BDT {Number(stats?.total || 0).toFixed(2)}
                </p>
              </div>

              <div className="cursor-pointer bg-linear-to-br from-blue-50 to-blue-100 p-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="text-xs font-semibold text-blue-700">Transactions</p>
                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {expenses.length}
                </p>
              </div>

              <div className="cursor-pointer bg-linear-to-br from-purple-50 to-purple-100 p-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="text-xs font-semibold text-purple-700">Average</p>
                <p className="mt-2 text-2xl font-bold text-purple-900">
                  BDT {(expenses.length > 0 ? (stats?.total || 0) / expenses.length : 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Budget Management</h3>
              {/* <p className="mt-1 text-sm text-slate-500">Set monthly category limits and get alerts when spending crosses them.</p> */}
            </div>
            <button
              type="button"
              onClick={() => saveBudgetsMutation.mutate()}
              className="bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Save Budgets
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(stats?.by_category || []).map((item, index) => {
              const budget = budgets.find((entry) => entry.category_id === item.category_id);
              const draftValue = budgetDrafts[item.category_id] ?? String(budget?.limit_amount || '');
              const usage = budget?.usage_percentage ?? 0;
              const categoryKey = item.category_id ?? item.category?.id ?? `category-${index}`;

              return (
                <div key={categoryKey} className="border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex w-full items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {item.category?.name || 'Category'}
                      </p>

                      <p className="text-sm text-slate-500 text-right">
                        Spent:{' '}
                        <span className="font-semibold text-slate-800">
                          BDT {Number(item.total || 0).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    {budget?.is_exceeded && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        Exceeded
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftValue}
                      onChange={(event) =>
                        setBudgetDrafts((current) => ({
                          ...current,
                          [item.category_id]: event.target.value,
                        }))
                      }
                      placeholder="Monthly budget"
                      className="h-11 w-full border border-slate-200 px-4"
                    />
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${usage > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(usage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{usage.toFixed(0)}% of budget used</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                All Expenses (<span className="text-red-500">{Math.min(5, expenses.length)}</span>/{expenses.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/expenses-all')}
              className="bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-slate-800 hover:scale-105 hover:shadow-lg hover:shadow-slate-900/30 active:scale-95"
            >
              View All
            </button>
          </div>

          <ExpenseList
            expenses={expenses.slice(0, 5)}
            isLoading={isLoading}
            onRefresh={() => {}}
          />
        </section>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-2xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 md:bottom-10 md:right-10 lg:bottom-12 lg:right-12"
          title="Add Expense"
        >
          <PlusIcon className="h-7 w-7" />
        </button>

        <Modal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          title="Add Expense"
          size="lg"
        >
          <AddExpenseForm
            onSuccess={() => setIsAddExpenseOpen(false)}
            onCancel={() => setIsAddExpenseOpen(false)}
          />
        </Modal>
      </div>
    </UserLayout>
  );
};
