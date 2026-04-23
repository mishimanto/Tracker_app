// frontend/src/components/Dashboard/RecentActivity.tsx
import React from 'react';
import { Task, Expense } from '../../types';
import { format } from 'date-fns';
import { CheckCircleIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface RecentActivityProps {
  tasks: Task[];
  expenses: Expense[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ tasks = [], expenses = [] }) => {
  const activities = [
    ...tasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      status: task.status,
      date: task.created_at,
      data: task,
    })),
    ...expenses.map(expense => ({
      id: `expense-${expense.id}`,
      type: 'expense' as const,
      title: expense.description,
      amount: expense.amount,
      date: expense.created_at,
      data: expense,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <ClockIcon className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="group flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors duration-150"
        >
          {/* Icon */}
          <div className={`shrink-0 p-2.5 ${
            activity.type === 'task'
              ? activity.data.status === 'completed'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-blue-100 text-blue-600'
              : 'bg-amber-100 text-amber-600'
          }`}>
            {activity.type === 'task' ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : (
              <CurrencyDollarIcon className="h-4 w-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {activity.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {activity.type === 'task' && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activity.data.status === 'completed'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-blue-700 bg-blue-50'
                }`}>
                  {activity.data.status}
                </span>
              )}
              {activity.type === 'expense' && (
                <span className="text-xs font-semibold text-amber-700">
                  BDT {Number(activity.data.amount).toFixed(2)}
                </span>
              )}
              <span className="text-xs text-slate-400">
                {format(new Date(activity.date), 'MMM dd, HH:mm')}
              </span>
            </div>
          </div>

          {/* Type badge */}
          <span className={`shrink-0 text-xs font-medium px-2 py-1 ${
            activity.type === 'task'
              ? 'bg-slate-100 text-slate-500'
              : 'bg-amber-50 text-amber-600'
          }`}>
            {activity.type === 'task' ? 'Task' : 'Expense'}
          </span>
        </div>
      ))}
    </div>
  );
};