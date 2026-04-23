import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../../components/Layout/UserLayout';
import { ExpenseList } from '../../components/Expenses/ExpenseList';
import { expenseService } from '../../services/expenseService';

export const AllExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [search, setSearch] = useState('');
  const [amountMin, setAmountMin] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['all-expenses', selectedPeriod, search, amountMin],
    queryFn: async () => {
      const base = await expenseService.getExpensesByPeriod(selectedPeriod);
      return base.filter((expense) => {
        const matchSearch = search.trim()
          ? expense.description.toLowerCase().includes(search.trim().toLowerCase()) ||
            (expense.category?.name || '').toLowerCase().includes(search.trim().toLowerCase())
          : true;
        const matchMin = amountMin ? Number(expense.amount) >= Number(amountMin) : true;
        return matchSearch && matchMin;
      });
    },
  });

  const periodLabels = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        {/* <section className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/expenses')}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Expenses</h1>
              <p className="mt-1 text-sm text-slate-500">Complete list of all your expenses</p>
            </div>
          </div>
        </section> */}

        {/* Period Selector */}
        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                <span className='font-semibold text-blue-600'>{periodLabels[selectedPeriod]}'s</span> expenses ({expenses.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by amount description or category"
              className="h-11 border border-slate-200 px-4"
            />
            <input
              type="number"
              value={amountMin}
              onChange={(event) => setAmountMin(event.target.value)}
              placeholder="Minimum amount"
              className="h-11 border border-slate-200 px-4"
            />
          </div>
       
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onRefresh={() => {}}
          />
        </section>
      </div>
    </UserLayout>
  );
};
