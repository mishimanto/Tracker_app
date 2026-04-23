import React from 'react';
import {
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { Button } from '../UI/Button';
import type { TaskFilters as TaskQueryFilters } from '../../services/taskService';

interface FilterFormState {
  status: 'all' | 'pending' | 'in_progress' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  search: string;
}

interface TaskFiltersProps {
  filters: TaskQueryFilters;
  onApply: (filters: TaskQueryFilters) => void;
  onReset: () => void;
  isMobile?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const defaultFilters: FilterFormState = {
  status: 'all',
  priority: 'all',
  search: '',
};

const toFormState = (filters: TaskQueryFilters): FilterFormState => ({
  status:
    filters.status === 'pending' ||
    filters.status === 'in_progress' ||
    filters.status === 'completed'
      ? filters.status
      : 'all',
  priority:
    filters.priority === 'low' ||
    filters.priority === 'medium' ||
    filters.priority === 'high'
      ? filters.priority
      : 'all',
  search: filters.search ?? '',
});

const toQueryFilters = (filters: FilterFormState): TaskQueryFilters => {
  const search = filters.search.trim();

  return {
    status: filters.status === 'all' ? undefined : filters.status,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    search: search.length >= 3 ? search : undefined,
  };
};

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onApply,
  onReset,
  isMobile = false,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const [draftFilters, setDraftFilters] = React.useState<FilterFormState>(
    toFormState(filters)
  );
  const [isOpen, setIsOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    setDraftFilters(toFormState(filters));
  }, [filters]);

  React.useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const handleChange = (
    key: keyof FilterFormState,
    value: FilterFormState[keyof FilterFormState]
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApply(toQueryFilters(draftFilters));
  };

  const handleReset = () => {
    setDraftFilters(defaultFilters);
    onReset();
  };

  const hasPendingChanges =
    JSON.stringify(draftFilters) !== JSON.stringify(toFormState(filters));

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-linear-to-br from-white via-slate-50 to-sky-50 shadow-sm">
      <div className="border-b border-slate-200/80 px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => isMobile && setIsOpen((current) => !current)}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="bg-slate-900 p-2 text-white shadow-sm">
              <FunnelIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Filters</h3>
              {!isMobile && (
                <p className="mt-1 text-sm text-slate-500">
                  Search, status, and priority filters for a cleaner task view.
                </p>
              )}
            </div>
            {isMobile && (
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          <div className="flex shrink-0 items-center gap-2">
            {!isMobile && onViewModeChange && (
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onViewModeChange('grid')}
                  aria-label="Grid view"
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  aria-label="List view"
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Bars3BottomLeftIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            <Button variant="outline" type="button" onClick={handleReset}>
              Clear
            </Button>
            <Button type="button" onClick={handleApply} disabled={!hasPendingChanges}>
              <SparklesIcon className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`grid overflow-hidden px-4 transition-[grid-template-rows,opacity,padding] duration-200 sm:px-6 ${
          isMobile
            ? isOpen
              ? 'grid-rows-[1fr] py-4 opacity-100'
              : 'grid-rows-[0fr] py-0 opacity-0'
            : 'grid-rows-[1fr] py-4 opacity-100 sm:py-5'
        }`}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={draftFilters.search}
                  onChange={(e) => handleChange('search', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApply();
                    }
                  }}
                  className="h-12 w-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Status
              </label>
              <select
                value={draftFilters.status}
                onChange={(e) =>
                  handleChange('status', e.target.value as FilterFormState['status'])
                }
                className="h-12 w-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Priority
              </label>
              <select
                value={draftFilters.priority}
                onChange={(e) =>
                  handleChange('priority', e.target.value as FilterFormState['priority'])
                }
                className="h-12 w-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
