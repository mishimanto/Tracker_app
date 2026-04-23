import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { expenseService } from '../../services/expenseService';
import { ExpenseCategory } from '../../types';
import { PaperClipIcon } from '@heroicons/react/24/outline';

interface AddExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onSuccess, onCancel }) => {
  const buildDefaultValues = () => ({
    amount: '',
    description: '',
    category_id: '',
    payment_method: 'cash',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
    is_recurring: false,
    recurrence_frequency: 'monthly',
    recurrence_interval: '1',
    recurrence_end_date: '',
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: buildDefaultValues(),
  });

  const queryClient = useQueryClient();
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseService.getCategories(),
    retry: 3,
    retryDelay: 1000,
  });

  const resetFormState = () => {
    reset(buildDefaultValues());
    setReceiptPreview(null);
    setAttachmentFile(null);
  };

  const createExpenseMutation = useMutation({
    mutationFn: (formData: FormData) => expenseService.createExpense(formData),
    onSuccess: () => {
      toast.success('Expense added successfully!');
      resetFormState();
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to create expense';
      toast.error(message as string);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('amount', parseFloat(data.amount).toString());
    formData.append('description', data.description.trim());
    formData.append('category_id', data.category_id.toString());
    formData.append('payment_method', data.payment_method);
    formData.append('expense_date', data.expense_date);
    if (data.notes) formData.append('notes', data.notes.trim());
    if (data.is_recurring) {
      formData.append('is_recurring', '1');
      formData.append('recurrence_frequency', data.recurrence_frequency);
      formData.append('recurrence_interval', data.recurrence_interval);
      if (data.recurrence_end_date) {
        formData.append('recurrence_end_date', data.recurrence_end_date);
      }
    }
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
      if (attachmentFile.type.startsWith('image/')) {
        formData.append('receipt_image', attachmentFile);
      }
    }
    createExpenseMutation.mutate(formData);
  };

  const handleCancel = () => {
    resetFormState();
    onCancel?.();
  };

  return (
    <div className="space-y-5">

      {categoriesError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load expense categories. Please refresh the page.
        </div>
      )}

      {!categoriesError && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="number"
              label="Amount"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid amount' },
              })}
            />

            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                {...register('category_id', { required: 'Category is required' })}
                disabled={loadingCategories}
                className={`block w-full border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.category_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
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

            <Input
              type="date"
              label="Expense Date"
              error={errors.expense_date?.message}
              {...register('expense_date', { required: 'Date is required' })}
            />

            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                {...register('payment_method')}
                className="block w-full border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            placeholder="What did you spend on?"
            error={errors.description?.message}
            {...register('description', { required: 'Description is required' })}
          />

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              placeholder="Additional notes..."
              rows={2}
              className="block w-full border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 border border-slate-200 p-4 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input type="checkbox" {...register('is_recurring')} />
              Create recurring expense
            </label>
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Frequency</label>
              <select
                {...register('recurrence_frequency')}
                className="block w-full border border-gray-300 p-2.5 shadow-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <Input
              label="Repeat Every"
              type="number"
              min="1"
              max="12"
              {...register('recurrence_interval')}
            />
            <div className="md:col-span-3">
              <Input
                label="Recurring End Date (Optional)"
                type="date"
                {...register('recurrence_end_date')}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Attachment (Receipt image or PDF)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex flex-1 cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 px-6 py-4 transition hover:border-gray-400">
                <div className="text-center">
                  <PaperClipIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600">Upload receipt image or invoice PDF</p>
                  {/* <p className="mt-1 text-xs text-gray-500">Images are optimized; PDFs are stored as-is.</p> */}
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {receiptPreview && (
                <div className="flex-1">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="h-20 w-20 object-cover"
                  />
                </div>
              )}
              {!receiptPreview && attachmentFile && (
                <div className="flex-1 rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                  {attachmentFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={createExpenseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createExpenseMutation.isPending}
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
