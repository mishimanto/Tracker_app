import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  QueueListIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { StatsCard } from '../../components/Dashboard/StatsCard';

export const AdminDashboard: React.FC = () => {
  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: adminService.getOverview,
  });

  const stats = overview?.stats;
  const analytics = overview?.analytics;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-violet-900 p-6 text-white shadow-xl sm:p-8">
          <div className="relative flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">System Overview</h1>
            <p className="mt-2 text-sm text-slate-300">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers || 0}
              icon={<UsersIcon className="h-5 w-5" />}
              color="blue"
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsers || 0}
              icon={<UserCircleIcon className="h-5 w-5" />}
              color="purple"
            />
            <StatsCard
              title="Total Tasks"
              value={stats.totalTasks || 0}
              icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
              color="green"
            />
            <StatsCard
              title="Total Expenses"
              value={`BDT ${Number(stats.totalExpenses || 0).toFixed(2)}`}
              icon={<CurrencyDollarIcon className="h-5 w-5" />}
              color="orange"
            />
            <StatsCard
              title="Notes"
              value={stats.totalNotes || 0}
              icon={<DocumentTextIcon className="h-5 w-5" />}
              color="blue"
            />
          </div>
        )}

        {analytics && (
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-emerald-100 p-3 text-emerald-700">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Monthly Expenses</p>
                  <p className="text-3xl font-bold text-green-700">
                    BDT {Number(analytics.total_monthly_expenses || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-amber-100 p-3 text-amber-700">
                  <ChartBarSquareIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending Tasks ({analytics.pending_tasks?.count || 0} of {analytics.pending_tasks?.total || 0})</p>
                  <p className="text-3xl font-bold text-red-700">
                    {Number(analytics.pending_tasks?.percentage || 0).toFixed(2)}%
                  </p>
                  {/* <p className="mt-1 text-sm text-slate-500">
                    {analytics.pending_tasks?.count || 0} pending/in progress of {analytics.pending_tasks?.total || 0} tasks
                  </p> */}
                </div>
              </div>
            </div>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Top Spending Categories</h2>
                <span className="text-sm text-slate-500">This month</span>
              </div>
              <div className="space-y-3">
                {analytics.top_spending_categories.length === 0 ? (
                  <p className="text-sm text-slate-500">No monthly expense data yet.</p>
                ) : (
                  analytics.top_spending_categories.map((item) => (
                    <div key={item.category_id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.category?.name || 'Unknown category'}</p>
                        <p className="text-sm text-slate-500">{item.expense_count} expense entries</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">
                        BDT {Number(item.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Most Active Users</h2>
                <span className="text-sm text-slate-500">Overall engagement</span>
              </div>
              <div className="space-y-3">
                {analytics.most_active_users.length === 0 ? (
                  <p className="text-sm text-slate-500">No user activity yet.</p>
                ) : (
                  analytics.most_active_users.map((user) => (
                    <div key={user.id} className="bg-slate-50 px-4 py-3 gap-3 flex items-center justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          {/* <p className="text-sm text-slate-500">{user.email}</p> */}
                        </div>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                          Score: {user.activity_score}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Task: <span className="font-semibold text-green-700">{user.tasks_count}</span>, Expense: <span className="font-semibold text-green-700">{user.expenses_count}</span>, Note: <span className="font-semibold text-green-700">{user.notes_count}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>
        )}

        {overview && (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QueueListIcon className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Recent Activity Logs</h2>
                </div>
                <span className="text-sm text-slate-500">{overview.recent_activity_logs.length} shown</span>
              </div>
              <div className="space-y-3">
                {overview.recent_activity_logs.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity logs yet.</p>
                ) : (
                  overview.recent_activity_logs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-2  bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{log.description}</p>
                        <p className="text-sm text-slate-500">
                          User: <span className="font-semibold">{log.actor?.name || 'System'}</span>
                          {log.target_user && log.target_user.id !== log.actor?.id ? ` | Target: ${log.target_user.name}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
                <span className="text-sm text-slate-500">{overview.recent_users.length} shown</span>
              </div>
              <div className="space-y-3">
                {overview.recent_users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      {/* <p className="text-sm text-slate-500">{user.email}</p> */}
                    </div>
                    <span
                      className={`bg-white px-3 py-1 text-xs font-semibold ${
                        user.status === 'active' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {user.status || 'inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
                <span className="text-sm text-slate-500">{overview.recent_tasks.length} shown</span>
              </div>
              <div className="space-y-3">
                {overview.recent_tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-sm text-slate-500">
                        by <span className="font-semibold">{task.user?.name || 'Unknown user'}</span>
                      </p>
                    </div>
                    <span className={`bg-white px-3 py-1 text-xs font-semibold ${
                      task.status === 'completed' ? 'text-green-700' : 'text-yellow-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Expenses</h2>
                <span className="text-sm text-slate-500">{overview.recent_expenses.length} shown</span>
              </div>
              <div className="space-y-3">
                {overview.recent_expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <p className="text-sm text-slate-500">
                        by <span className="font-semibold">{expense.user?.name || 'Unknown user'}</span>
                      </p>
                    </div>
                    <span className="bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                      BDT {Number(expense.amount || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Notes</h2>
                <span className="text-sm text-slate-500">{overview.recent_notes.length} shown</span>
              </div>
              <div className="space-y-3">
                {overview.recent_notes.map((note) => (
                  <div key={note.id} className="bg-slate-50 px-4 py-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{note.title}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      by <span className="font-semibold">{note.user?.name || 'Unknown user'}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
