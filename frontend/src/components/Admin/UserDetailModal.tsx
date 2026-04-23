import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '../UI/Modal';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'expenses' | 'notes'>('info');
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => adminService.getUserDetails(userId),
    enabled: isOpen && userId > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'active' | 'inactive' | 'banned') =>
      adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      toast.success('User status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-detail', userId] });
    },
    onError: () => {
      toast.error('Failed to update user status.');
    },
  });

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details">
        <p className="text-gray-500">User not found</p>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Info Section */}
        <div className="border-b pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-lg font-semibold">
                <span
                  className={`rounded-full text-sm font-semibold ${
                    user.role === 'admin'
                      ? 'text-purple-800'
                      : 'text-blue-800'
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-500">User Status</p>
              <div className="flex flex-wrap gap-2">
                {(['active', 'inactive', 'banned'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatusMutation.mutate(status)}
                    disabled={updateStatusMutation.isPending}
                    className={`px-3 py-1 text-sm font-semibold transition mt-2 ${
                      user.status === status
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Tasks ({user.task_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'expenses'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Expenses ({user.expense_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Notes ({user.note_count || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{user.task_count || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {user.tasks_completed || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${Number(user.total_expenses || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-2xl font-bold text-violet-600">{user.note_count || 0}</p>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {user.recent_tasks && user.recent_tasks.length > 0 ? (
                <div className="space-y-3">
                  {user.recent_tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tasks found</p>
              )}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div>
              {user.recent_expenses && user.recent_expenses.length > 0 ? (
                <div className="space-y-3">
                  {user.recent_expenses.map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {expense.category?.name}
                        </p>
                        <p className="text-sm text-gray-600">{expense.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900">
                          ${expense.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {expense.payment_method}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No expenses found</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              {user.recent_notes && user.recent_notes.length > 0 ? (
                <div className="space-y-3">
                  {user.recent_notes.map((note: any) => (
                    <div key={note.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{note.title}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-sm text-gray-600">{note.content || 'No content'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No notes found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
