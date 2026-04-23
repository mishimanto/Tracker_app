import React, { useMemo, useState } from 'react';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../UI/Modal';
import { CalendarDay } from '../../types';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

interface ActivityCalendarProps {
  cursor: Date;
  days: CalendarDay[];
  onCursorChange: (date: Date) => void;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  cursor,
  days,
  onCursorChange,
}) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const monthLabel = useMemo(
    () => cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [cursor]
  );

  const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  const calendarCells = useMemo(() => {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    const gridEnd = new Date(monthEnd);
    gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

    const cells: Array<{
      date: Date;
      dayData: CalendarDay | null;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const current = new Date(gridStart);
    while (current <= gridEnd) {
      const key = formatDateKey(current);
      cells.push({
        date: new Date(current),
        dayData: dayMap.get(key) ?? null,
        isCurrentMonth: current.getMonth() === cursor.getMonth(),
        isToday: isSameDay(current, new Date()),
      });
      current.setDate(current.getDate() + 1);
    }

    return cells;
  }, [cursor, dayMap]);

  const currentMonthCells = useMemo(
    () => calendarCells.filter((cell) => cell.isCurrentMonth),
    [calendarCells]
  );

  const totals = useMemo(() => {
    return days.reduce(
      (acc, day) => {
        acc.totalExpenses += day.expense_total || 0;
        acc.totalExpenseEntries += day.expense_count || 0;
        acc.totalTasks += day.task_count || 0;
        acc.activeDays += day.expense_count > 0 || day.task_count > 0 ? 1 : 0;
        return acc;
      },
      {
        totalExpenses: 0,
        totalExpenseEntries: 0,
        totalTasks: 0,
        activeDays: 0,
      }
    );
  }, [days]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-sky-900 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 py-1 text-md font-semibold uppercase tracking-[0.18em] text-sky-100">
                <CalendarDaysIcon className="h-6 w-6" />
                Monthly Overview
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 self-start rounded-full border border-white/15 bg-white/10 p-1 sm:w-auto sm:justify-start">
              <button
                type="button"
                onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="rounded-full p-2 text-white transition hover:bg-white/10"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="min-w-0 flex-1 text-center text-sm font-semibold text-slate-100 sm:min-w-36 sm:flex-none">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="rounded-full p-2 text-white transition hover:bg-white/10"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
          <div className="bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Active Days</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totals.activeDays}</p>
          </div>
          <div className="bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Expense Entries</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totals.totalExpenseEntries}</p>
          </div>
          <div className="bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Tasks Due</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totals.totalTasks}</p>
          </div>
          <div className="bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total Spending</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">BDT {totals.totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-7 border-b border-slate-200 bg-slate-50 lg:grid">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-4"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-7 lg:grid">
          {calendarCells.map((cell) => {
            const stats = cell.dayData ?? {
              date: formatDateKey(cell.date),
              expense_total: 0,
              expense_count: 0,
              task_count: 0,
              expenses: [],
              tasks: [],
            };

            const hasActivity = stats.expense_count > 0 || stats.task_count > 0;

            return (
              <button
                key={stats.date}
                type="button"
                onClick={() => setSelectedDay(stats)}
                className={`group min-h-36 border-b border-r border-slate-200 p-3 text-left align-top transition sm:min-h-40 sm:p-4 ${
                  cell.isCurrentMonth ? 'bg-white hover:bg-sky-50/50' : 'bg-slate-50/70 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      cell.isToday
                        ? 'bg-sky-600 text-white'
                        : cell.isCurrentMonth
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-transparent text-slate-400'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {hasActivity && (
                    <span className="rounded-sm bg-red-100 px-2 py-0.5 text-[13px] font-bold tracking-[0.12em] text-red-500">
                      ITEM: {stats.expense_count + stats.task_count}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between bg-emerald-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-emerald-800">{stats.expense_count}</span>
                  </div>

                  <div className="flex items-center justify-between bg-sky-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <RectangleStackIcon className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="text-sm font-bold text-sky-800">{stats.task_count}</span>
                  </div>

                  <div className="border border-dashed border-slate-200 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Spend
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      BDT {Number(stats.expense_total || 0).toFixed(2)}
                    </p>
                  </div>

                  <p className={`text-center text-xs font-medium ${hasActivity ? 'text-sky-700' : 'text-slate-400'}`}>
                    {hasActivity ? 'Click to open day details' : 'No activity scheduled'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
          {currentMonthCells.map((cell) => {
            const stats = cell.dayData ?? {
              date: formatDateKey(cell.date),
              expense_total: 0,
              expense_count: 0,
              task_count: 0,
              expenses: [],
              tasks: [],
            };

            const hasActivity = stats.expense_count > 0 || stats.task_count > 0;

            return (
              <button
                key={stats.date}
                type="button"
                onClick={() => setSelectedDay(stats)}
                className={`border p-4 text-left transition ${
                  cell.isToday
                    ? 'border-sky-300 bg-sky-50/70'
                    : hasActivity
                      ? 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {cell.date.toLocaleDateString(undefined, { weekday: 'long' })}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                          cell.isToday ? 'bg-sky-600 text-white' : 'bg-slate-900 text-white'
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {cell.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-slate-500">
                          {hasActivity ? 'Tap to open details' : 'No activity scheduled'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {hasActivity && (
                    <span className="rounded-md bg-red-100 px-2 py-1 text-[11px] font-bold tracking-[0.12em] text-red-600">
                      {stats.expense_count + stats.task_count} ITEMS
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                        Expense
                      </span>
                    </div>
                    <p className="mt-2 text-base font-bold text-emerald-800">{stats.expense_count}</p>
                  </div>

                  <div className="bg-sky-50 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                        Tasks
                      </span>
                    </div>
                    <p className="mt-2 text-base font-bold text-sky-800">{stats.task_count}</p>
                  </div>

                  <div className="border border-dashed border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Spend
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      BDT {Number(stats.expense_total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Modal
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={
          selectedDay
            ? new Date(selectedDay.date).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Day Details'
        }
        size="lg"
      >
        {selectedDay && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Total Expense</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  BDT {Number(selectedDay.expense_total || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Expense Count</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{selectedDay.expense_count}</p>
              </div>
              <div className="rounded-xl bg-sky-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Task Count</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{selectedDay.task_count}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section>
                <h3 className="text-lg font-semibold text-slate-900">Expense Details</h3>
                <div className="mt-3 space-y-3">
                  {selectedDay.expenses.length === 0 ? (
                    <p className="text-sm text-slate-400">No expenses for this day.</p>
                  ) : (
                    selectedDay.expenses.map((expense) => (
                      <div key={expense.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{expense.description}</p>
                          <span className="text-sm font-bold text-emerald-700">
                            BDT {Number(expense.amount).toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {expense.category?.name || 'Uncategorized'} - {expense.payment_method}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-900">Task Details</h3>
                <div className="mt-3 space-y-3">
                  {selectedDay.tasks.length === 0 ? (
                    <p className="text-sm text-slate-400">No tasks for this day.</p>
                  ) : (
                    selectedDay.tasks.map((task) => (
                      <div key={task.id} className="rounded-xl border border-slate-200 bg-sky-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <span className="text-xs font-semibold uppercase text-sky-700">{task.priority}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {task.status} {task.due_time ? `- ${task.due_time}` : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
