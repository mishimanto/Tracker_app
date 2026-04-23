import React, { useMemo, useState } from 'react';
import {
  CalendarIcon,
  EyeIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { Expense } from '../../types';
import { ExpenseModal } from './ExpenseModal';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  onRefresh,
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: { [key: string]: Expense[] } = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.expense_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
    });

    // Sort by date descending
    return Object.entries(groups)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime()
      )
      .reduce(
        (acc, [date, items]) => {
          acc[date] = items.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          return acc;
        },
        {} as { [key: string]: Expense[] }
      );
  }, [expenses]);

  const openModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  // if (isLoading) {
  //   return (
  //     <div className="space-y-4">
  //       {[1, 2, 3].map((i) => (
  //         <div key={i} className="h-20 -2xl bg-slate-100 animate-pulse" />
  //       ))}
  //     </div>
  //   );
  // }

  if (expenses.length === 0) {
    return (
      <div className="-3xl border-2 border-dashed border-slate-200 p-8 text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">No expenses found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="my-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                {date}
              </p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Expenses for this date */}
            <div className="space-y-3">
              {dateExpenses.map((expense) => (
                <div
                    onClick={() => openModal(expense)}
                    key={expense.id}
                    className="group border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition-all hover:cursor-pointer"
                    >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {expense.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 -lg bg-slate-100 text-slate-700">
                          {expense.category?.name || 'N/A'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {expense.payment_method
                            ? expense.payment_method.charAt(0).toUpperCase() +
                              expense.payment_method.slice(1)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-900">
                        BDT {Number(expense.amount || 0).toFixed(2)}
                      </p>
                    </div>                    
                  </div>

                  {/* Receipt image preview */}
                  {/* {expense.receipt_image && (
                    <div className="mt-3">
                      <img
                        src={expense.receipt_image}
                        alt="Receipt"
                        className="h-16 w-16 -lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openModal(expense)}
                      />
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        expense={selectedExpense}
        onClose={closeModal}
      />
    </>
  );
};
