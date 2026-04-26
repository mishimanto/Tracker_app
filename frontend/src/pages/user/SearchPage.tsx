import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { UserLayout } from '../../components/Layout/UserLayout';
import { searchService } from '../../services/searchService';
import { expenseService } from '../../services/expenseService';

export const SearchPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('query') || '');
  const [categoryId, setCategoryId] = useState(params.get('category_id') || '');
  const [priority, setPriority] = useState(params.get('priority') || '');

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseService.getCategories(),
  });

  const { data: results = { expenses: [], tasks: [] }, refetch, isFetching } = useQuery({
    queryKey: ['global-search', params.toString()],
    queryFn: () =>
      searchService.search({
        query: params.get('query') || undefined,
        category_id: params.get('category_id') ? Number(params.get('category_id')) : undefined,
        priority: params.get('priority') || undefined,
        date_from: params.get('date_from') || undefined,
        date_to: params.get('date_to') || undefined,
        amount_min: params.get('amount_min') ? Number(params.get('amount_min')) : undefined,
        amount_max: params.get('amount_max') ? Number(params.get('amount_max')) : undefined,
      }),
  });

  useEffect(() => {
    setQuery(params.get('query') || '');
    setCategoryId(params.get('category_id') || '');
    setPriority(params.get('priority') || '');
  }, [params]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const applySearch = () => {
    const next = new URLSearchParams(params);
    query ? next.set('query', query) : next.delete('query');
    categoryId ? next.set('category_id', categoryId) : next.delete('category_id');
    priority ? next.set('priority', priority) : next.delete('priority');
    setParams(next);
    refetch();
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <section className="border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
          {/* <h1 className="text-2xl font-semibold text-slate-900">Global Search</h1>
          <p className="mt-1 text-sm text-slate-500">Find expenses by amount/category and tasks by priority or text.</p> */}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search text"
              className="h-11 border border-slate-200 px-4"
            />
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-11 border border-slate-200 px-4"
            >
              <option value="">Exepense categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="h-11 border border-slate-200 px-4"
            >
              <option value="">Task priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="button"
              onClick={applySearch}
              className="h-11 bg-slate-900 px-4 text-sm font-semibold text-white"
            >
              {isFetching ? 'Searching...' : 'Apply Search'}
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Expenses</h2>
            <div className="mt-4 space-y-3">
              {results.expenses.map((expense) => (
                <div key={expense.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{expense.description}</p>
                    <span className="text-sm font-semibold text-emerald-600">BDT {Number(expense.amount).toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {expense.category?.name || 'Uncategorized'} • Date: <span className='font-semibold'>{formatDate(expense.expense_date)}</span>
                  </p>
                </div>
              ))}
              {results.expenses.length === 0 && <p className="text-sm text-slate-400">No expenses matched.</p>}
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            <div className="mt-4 space-y-3">
              {results.tasks.map((task) => (
                <div key={task.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <span className="text-xs font-semibold uppercase text-sky-600">{task.priority}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                  {task.status} • Due: <span className='font-semibold'>{formatDate(task.due_date)}</span>
                </p>
                </div>
              ))}
              {results.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks matched.</p>}
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
};
