import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { expenseService } from '../../services/expenseService';
import { Expense, ExpenseCategory } from '../../types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { PaperClipIcon } from '@heroicons/react/24/outline';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditFormValues {
  amount: string;
  description: string;
  category_id: string;
  payment_method: string;
  expense_date: string;
  notes: string;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>();

  // Populate form when expense changes
  useEffect(() => {
    if (expense && isOpen) {
      // Normalize date to YYYY-MM-DD — API may return full ISO string (e.g. 2026-04-15T00:00:00Z)
      // which causes type="date" inputs to render blank
      const normalizedDate = expense.expense_date
        ? expense.expense_date.split('T')[0]
        : new Date().toISOString().split('T')[0];

      reset({
        amount: String(expense.amount),
        description: expense.description,
        category_id: String(expense.category_id),
        payment_method: expense.payment_method,
        expense_date: normalizedDate,
        notes: expense.notes || '',
      });
      setAttachmentFile(null);
    }
  }, [expense, isOpen, reset]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | Partial<Expense> }) =>
      expenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      toast.success('Expense updated successfully!');
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.response?.data?.message || 'Failed to update expense';
      toast.error(message as string);
    },
  });

  const onSubmit = (values: EditFormValues) => {
    if (!expense) return;
    const formData = new FormData();
    formData.append('amount', String(parseFloat(values.amount)));
    formData.append('description', values.description.trim());
    formData.append('category_id', String(Number(values.category_id)));
    formData.append('payment_method', values.payment_method);
    formData.append('expense_date', values.expense_date);
    if (values.notes.trim()) {
      formData.append('notes', values.notes.trim());
    }
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
      if (attachmentFile.type.startsWith('image/')) {
        formData.append('receipt_image', attachmentFile);
      }
    }

    updateMutation.mutate({
      id: expense.id,
      data: formData,
    });
  };

  if (!expense) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg rounded-md bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Edit Expense
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amount */}
                    <Input
                      type="number"
                      label="Amount"
                      step="0.01"
                      placeholder="0.00"
                      error={errors.amount?.message}
                      {...register('amount', {
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Must be > 0' },
                      })}
                    />

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        {...register('category_id', { required: 'Category is required' })}
                        className="block w-full p-2.5 border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select category</option>
                        {categories?.map((cat: ExpenseCategory) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                      )}
                    </div>

                    {/* Date */}
                    <Input
                      type="date"
                      label="Expense Date"
                      error={errors.expense_date?.message}
                      {...register('expense_date', { required: 'Date is required' })}
                    />

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        {...register('payment_method')}
                        className="block w-full p-2.5 border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="mobile">Mobile Payment</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <Input
                    label="Description"
                    placeholder="What did you spend on?"
                    error={errors.description?.message}
                    {...register('description', { required: 'Description is required' })}
                  />

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Additional notes..."
                      className="block w-full p-2.5 border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-300 p-4">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                      <PaperClipIcon className="h-5 w-5" />
                      Replace attachment (image or PDF)
                      <input
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        className="hidden"
                        onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)}
                      />
                    </label>
                    {attachmentFile && <p className="mt-2 text-xs text-slate-500">{attachmentFile.name}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={updateMutation.isPending}
                      className="flex-1"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
