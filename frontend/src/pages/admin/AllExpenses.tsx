import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { PageLoaderTransition } from '../../components/UI/PageLoader';

export const AllExpenses: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['admin-all-expenses'],
    queryFn: adminService.getAllExpenses,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: adminService.deleteExpense,
    onSuccess: () => {
      toast.success('Expense deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-all-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: () => toast.error('Failed to delete expense.'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">All Expenses</h1>
          <span className="bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {expenses?.length || 0} records
          </span>
        </div>

       
          <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses?.map((expense: any) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{expense.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{expense.user?.name}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">{expense.category?.name}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-emerald-700">${expense.amount}</td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600">
                      {new Date(expense.expense_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    {/* <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => deleteExpenseMutation.mutate(expense.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       
      </div>
    </AdminLayout>
  );
};
