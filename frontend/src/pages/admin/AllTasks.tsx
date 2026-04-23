import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { PageLoaderTransition } from '../../components/UI/PageLoader';

export const AllTasks: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['admin-all-tasks'],
    queryFn: adminService.getAllTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'pending' | 'in_progress' | 'completed' }) =>
      adminService.updateTask(id, { status }),
    onSuccess: () => {
      toast.success('Task updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: () => toast.error('Failed to update task.'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: adminService.deleteTask,
    onSuccess: () => {
      toast.success('Task deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: () => toast.error('Failed to delete task.'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">All Tasks</h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {tasks?.length || 0} tasks
          </span>
        </div>

        {/* <PageLoaderTransition loading={isLoading} message="Loading tasks..."> */}
          <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks?.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{task.user?.name}</td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">
                      {new Date(task.due_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(event) =>
                            updateTaskMutation.mutate({
                              id: task.id,
                              status: event.target.value as 'pending' | 'in_progress' | 'completed',
                            })
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        {/* </PageLoaderTransition> */}
      </div>
    </AdminLayout>
  );
};
