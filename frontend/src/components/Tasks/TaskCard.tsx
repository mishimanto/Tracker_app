import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { Task } from '../../types';
import { Modal } from '../UI/Modal';
import { isTaskOverdue } from '../../utils/taskDeadline';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  viewMode?: 'grid' | 'list';
  itemNumber?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  viewMode = 'grid',
  itemNumber,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isListView = viewMode === 'list';

  const dueDate = useMemo(() => {
    if (!task.due_date) {
      return null;
    }

    const [year, month, day] = task.due_date.split('-').map(Number);
    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }, [task.due_date]);

  const formattedDueDate =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? format(dueDate, 'MMM dd, yyyy')
      : 'No due date';

  const timeDate = task.due_time ? new Date(`1970-01-01T${task.due_time}`) : null;
  const formattedDueTime =
    timeDate && !Number.isNaN(timeDate.getTime())
      ? format(timeDate, 'hh:mm a')
      : null;

  const isOverdue = useMemo(() => isTaskOverdue(task), [task]);

  const details = task.description?.trim() || '';
  const previewDetails = useMemo(() => {
    if (details.length <= 20) {
      return details || 'No details added';
    }

    return `${details.slice(0, 20)}...`;
  }, [details]);

  const priorityColors = {
    low: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    medium: 'bg-amber-50 text-amber-700 ring-amber-100',
    high: 'bg-rose-50 text-rose-700 ring-rose-100',
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-sky-100 text-sky-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <>
      <div
        className={`group overflow-hidden border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
          isOverdue ? 'border-rose-200 bg-rose-50/80' : 'border-slate-200 bg-white'
        } ${
          isListView ? 'p-4 sm:p-5' : 'p-5'
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                {typeof itemNumber === 'number' && (
                  <span className="inline-flex h-7 min-w-7 items-center justify-center  bg-slate-900 px-2 text-xs font-semibold text-white shadow-sm">
                    {itemNumber}
                  </span>
                )}

                <button
                  onClick={() => onToggleStatus(task.id)}
                  className="mt-0.5 shrink-0  text-slate-400 transition hover:text-emerald-500 focus:outline-none"
                >
                  {task.status === 'completed' ? (
                    <CheckCircleSolid className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <CheckCircleIcon className="h-6 w-6" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Task #{itemNumber}
                  </p>
                  <h3
                    className={`text-base font-semibold leading-6 text-slate-900 sm:text-lg ${
                      task.status === 'completed' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className={`flex shrink-0 items-center gap-1 p-1 ${isOverdue ? 'bg-rose-100/80' : 'bg-slate-50'}`}>
              <button
                onClick={() => onEdit(task)}
                className=" p-2 text-slate-400 transition hover:bg-white hover:text-blue-500"
              >
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className=" p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
              >
                <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className={`${isOverdue ? 'bg-rose-100/70' : 'bg-slate-50'} py-3`}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Details:
            </div>
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="mt-2 text-left text-sm leading-6 text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
            >
              {previewDetails}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={` px-3 py-1 text-xs font-semibold ring-1 ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
            <span
              className={` px-3 py-1 text-xs font-semibold ${isOverdue ? 'bg-rose-100 text-rose-700' : statusColors[task.status]}`}
            >
              {isOverdue ? 'overdue' : task.status.replace('_', ' ')}
            </span>
          </div>

          <div
            className={`grid gap-3 ${
              isListView ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <div className={`${isOverdue ? 'bg-rose-100/70' : 'bg-slate-50'} py-1`}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <CalendarDaysIcon className="h-4 w-4" />
                Due Date: <span className={`text-sm font-medium ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>{formattedDueDate}</span>
              </div>
            </div>

            <div className={`${isOverdue ? 'bg-rose-100/70' : 'bg-slate-50'} py-1`}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <ClockIcon className="h-4 w-4" />
                Due Time: <span className={` text-sm font-medium ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>{formattedDueTime || 'Not set'}</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={task.title}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={` px-3 py-1 text-xs font-semibold ring-1 ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
            <span
              className={` px-3 py-1 text-xs font-semibold ${isOverdue ? 'bg-rose-100 text-rose-700' : statusColors[task.status]}`}
            >
              {isOverdue ? 'overdue' : task.status.replace('_', ' ')}
            </span>
          </div>

          <div className={`${isOverdue ? 'bg-rose-100/70' : 'bg-slate-50'} px-4 py-4`}>
            <p className="text-sm leading-7 text-slate-700">
              {details || 'No details added for this task yet.'}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
