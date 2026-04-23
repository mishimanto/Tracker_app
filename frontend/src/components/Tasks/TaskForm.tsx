// frontend/src/components/Tasks/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Modal } from '../UI/Modal';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { useQueryClient } from '@tanstack/react-query';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  dueDate: yup.string().required('Due date is required'),
  dueTime: yup.string().nullable().default(''),
  priority: yup.string().oneOf(['low', 'medium', 'high']).default('medium'),
  isRecurring: yup.boolean().default(false),
  recurrencePattern: yup.string().oneOf(['daily', 'weekly', 'monthly']).default('weekly'),
});

type TaskFormData = yup.InferType<typeof schema>;
const defaultRecurrencePattern: TaskFormData['recurrencePattern'] = 'weekly';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TaskFormData) => Promise<void>;
  editingTask?: Task | null;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTask, 
  isLoading: externalLoading = false 
}) => {
  const queryClient = useQueryClient();
  const [internalLoading, setInternalLoading] = useState(false);
  
  const isLoading = externalLoading || internalLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '',
      priority: 'medium',
      isRecurring: false,
      recurrencePattern: defaultRecurrencePattern,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        reset({
          title: editingTask.title || '',
          description: editingTask.description || '',
          dueDate: editingTask.due_date || new Date().toISOString().split('T')[0],
          dueTime: editingTask.due_time || '',
          priority: editingTask.priority || 'medium',
          isRecurring: editingTask.is_recurring || false,
          recurrencePattern: (editingTask.recurrence_pattern as TaskFormData['recurrencePattern']) || defaultRecurrencePattern,
        });
      } else {
        reset({
          title: '',
          description: '',
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: '',
          priority: 'medium',
          isRecurring: false,
          recurrencePattern: defaultRecurrencePattern,
        });
      }
    }
  }, [isOpen, editingTask, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    if (onSubmit) {
      try {
        await onSubmit(data);
        reset();
        onClose();
      } catch (err: any) {
        toast.error(err.message || 'Failed to save task');
      }
      return;
    }
    
    setInternalLoading(true);
    
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        due_time: data.dueTime || null,
        priority: data.priority,
        is_recurring: data.isRecurring,
        recurrence_pattern: data.isRecurring ? data.recurrencePattern : null,
      };
      
      let result;
      if (editingTask?.id) {
        result = await taskService.updateTask(editingTask.id, taskData);
      } else {
        result = await taskService.createTask(taskData);
      }
      
      if (result) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['task-stats'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
        reset();
        onClose();
      } else {
        toast.error('Failed to save task. Please try again.');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errs = Object.values(err.response.data.errors).flat();
        toast.error((errs as string[]).join(', '));
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message || 'An error occurred while saving the task.');
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Task title"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            placeholder="Task description"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.description?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Due Date"
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
          <Input
            label="Due Time"
            type="time"
            {...register('dueTime')}
            error={errors.dueTime?.message}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            {...register('priority')}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          {errors.priority?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register('isRecurring')} />
            Make this task recurring
          </label>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeat Pattern
            </label>
            <select
              {...register('recurrencePattern')}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} type="button" className="!">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="!">
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
