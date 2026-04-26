import React, { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { taskService, type TaskFilters as TaskQueryFilters } from '../../services/taskService';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';
import { StatsCard } from '../Dashboard/StatsCard';
import { PageLoader } from '../UI/PageLoader';
import { Button } from '../UI/Button';
import { isTaskOverdue } from '../../utils/taskDeadline';

export const TaskList: React.FC = () => {
  const [filters, setFilters] = useState<TaskQueryFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');

    const syncMobileState = (event?: MediaQueryListEvent) => {
      setIsMobile(event ? event.matches : media.matches);
    };

    syncMobileState();
    media.addEventListener('change', syncMobileState);

    return () => media.removeEventListener('change', syncMobileState);
  }, []);

  const resolvedViewMode = isMobile ? 'list' : viewMode;

  const { data: tasksData, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
    placeholderData: keepPreviousData,
  });
  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: taskService.getTaskStats,
  });

  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const overdueTasks = tasks.filter(isTaskOverdue);
  const regularTasks = tasks.filter((task) => !isTaskOverdue(task));
  const showSeparatedOverdueSection = !filters.status;

  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete task. Please try again.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: taskService.toggleTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task status updated!');
    },
    onError: () => {
      toast.error('Failed to update task status.');
    },
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl! ',
        confirmButton: 'rounded-md! font-semibold!',
        cancelButton: 'rounded-md! font-semibold!',
      },
    });

    if (result.isConfirmed) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (id: number) => {
    await toggleStatusMutation.mutateAsync(id);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-red-50 px-6 py-10 text-center shadow-sm">
        <p className="text-red-600">
          Failed to load tasks: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // if (isLoading) {
  //   return (
  //     <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
  //       <PageLoader message="Loading tasks..." />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* <div className="border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-5 text-white shadow-lg sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">My Tasks ({tasks.length})</h1>
          </div>

          
        </div>
      </div> */}

      <TaskFilters
        filters={filters}
        onApply={setFilters}
        onReset={() => setFilters({})}
        isMobile={isMobile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={taskStats?.total || 0}
          icon={<RectangleStackIcon className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Completed"
          value={taskStats?.completed || 0}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          color="green"
          subtitle={taskStats?.total ? `${Math.round(((taskStats.completed || 0) / taskStats.total) * 100)}% done` : 'No tasks yet'}
        />
        <StatsCard
          title="Pending"
          value={taskStats?.pending || 0}
          icon={<ClockIcon className="h-5 w-5" />}
          color="amber"
          subtitle={`${taskStats?.today || 0} due today`}
        />
        <StatsCard
          title="Overdue"
          value={taskStats?.overdue || 0}
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
          color="red"
          subtitle="Needs attention"
        />
      </section>

      {tasks.length === 0 ? (
        <div className="border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
              <HiOutlineClipboardDocumentList className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">No tasks found</h3>
            <Button onClick={handleCreateNew} className="mt-5">
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Task
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {regularTasks.length > 0 && (
            <section className="space-y-4">
              {showSeparatedOverdueSection && overdueTasks.length > 0 && (
                <div className="border border-slate-200 bg-white px-4 py-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Active Tasks ({regularTasks.length})
                  </h3>
                </div>
              )}
              <div
                className={
                  resolvedViewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {regularTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    viewMode={resolvedViewMode}
                    itemNumber={showSeparatedOverdueSection ? overdueTasks.length + index + 1 : index + 1}
                  />
                ))}
              </div>
            </section>
          )}

          {showSeparatedOverdueSection && overdueTasks.length > 0 && (
            <section className="space-y-4">
              <div className="border border-rose-200 bg-gray-50 px-4 py-3">
                <h3 className="text-lg font-semibold text-rose-700">
                  Overdue Tasks ({overdueTasks.length})
                </h3>
              </div>
              <div
                className={
                  resolvedViewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {overdueTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    viewMode={resolvedViewMode}
                    itemNumber={index + 1}
                  />
                ))}
              </div>
            </section>
          )}

          

          {!showSeparatedOverdueSection && overdueTasks.length > 0 && (
            <div
              className={
                resolvedViewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                  : 'space-y-4'
              }
            >
              {overdueTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  viewMode={resolvedViewMode}
                  itemNumber={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingTask={editingTask}
      />

      <button
        type="button"
        onClick={handleCreateNew}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-indigo-600 text-white shadow-2xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 md:bottom-10 md:right-10 lg:bottom-12 lg:right-12"
        title="Add Task"
        aria-label="Add Task"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};
