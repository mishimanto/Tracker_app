import React, { Fragment, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Expense } from '../../types';
import {
  XMarkIcon,
  CalendarIcon,
  CreditCardIcon,
  TagIcon,
  PaperClipIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { expenseService } from '../../services/expenseService';
import { EditExpenseModal } from './EditExpenseModal';

interface ExpenseModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, expense, onClose }) => {
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      toast.success('Expense deleted!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to delete expense. Please try again.');
    },
  });

  const handleDelete = async () => {
    if (!expense) return;
    const result = await Swal.fire({
      title: 'Delete Expense?',
      text: `"${expense.description}" will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: '!rounded-2xl',
        confirmButton: '!rounded-xl !font-semibold',
        cancelButton: '!rounded-xl !font-semibold',
      },
    });
    if (result.isConfirmed) {
      deleteMutation.mutate(expense.id);
    }
  };

  if (!expense) return null;

  // Construct full image URL
  const imageUrl = expense.receipt_image
    ? `https://api.mytracker.shimzo.online/storage/${expense.receipt_image}`
    : null;
  const attachmentUrl = expense.attachment_path
    ? `https://api.mytracker.shimzo.online/storage/${expense.attachment_path}`
    : null;

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-2 text-center sm:items-center sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-md bg-white text-left shadow-2xl transition-all sm:my-8 sm:rounded-2xl">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none z-10"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>

                  {/* Content */}
                  <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-5 sm:p-6">
                    {/* Image */}
                    {imageUrl && (
                      <div className="mb-6">
                        <img
                          src={imageUrl}
                          alt="Expense receipt"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 pr-10">
                      {expense.description}
                    </h2>

                    {/* Amount */}
                    <p className="text-3xl font-bold text-emerald-600">
                      BDT {Number(expense.amount || 0).toFixed(2)}
                    </p>

                    {/* Details Grid */}
                    <div className="space-y-2 my-8">
                      {/* Category */}
                      <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 rounded-md">
                        <TagIcon className="h-5 w-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Category
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {expense.category?.name || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 rounded-md">
                        <CreditCardIcon className="h-5 w-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Payment Method
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {expense.payment_method
                              ? expense.payment_method.charAt(0).toUpperCase() +
                                expense.payment_method.slice(1)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 rounded-md">
                        <CalendarIcon className="h-5 w-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Date
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(expense.expense_date).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {expense.notes && (
                        <div className="p-3 rounded-md bg-slate-50">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Notes
                          </p>
                          <p className="mt-1 text-sm text-slate-900">{expense.notes}</p>
                        </div>
                      )}

                      {attachmentUrl && (
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"
                        >
                          <PaperClipIcon className="h-4 w-4" />
                          {expense.attachment_name || 'Open attachment'}
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deleteMutation.isPending ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit Modal */}
      <EditExpenseModal
        isOpen={isEditOpen}
        expense={expense}
        onClose={() => setIsEditOpen(false)}
        onSuccess={onClose}
      />
    </>
  );
};
