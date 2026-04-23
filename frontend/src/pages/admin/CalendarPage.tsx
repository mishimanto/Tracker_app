import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { ActivityCalendar } from '../../components/Calendar/ActivityCalendar';
import { adminService } from '../../services/adminService';

const formatMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const AdminCalendarPage: React.FC = () => {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const monthKey = formatMonth(cursor);

  const { data: users = [] } = useQuery({
    queryKey: ['admin-calendar-users'],
    queryFn: () => adminService.getUsers({ perPage: 100 }),
  });

  useEffect(() => {
    if (selectedUserId !== null || users.length === 0) {
      return;
    }

    setSelectedUserId(users[0].id);
  }, [selectedUserId, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  const { data: days = [], isLoading } = useQuery({
    queryKey: ['admin-calendar', selectedUserId, monthKey],
    queryFn: () => adminService.getCalendarMonth(selectedUserId as number, monthKey),
    enabled: selectedUserId !== null,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-sky-900 px-5 py-6 text-white sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                {/* <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">
                  <CalendarDaysIcon className="h-5 w-5" />
                  Admin Calendar
                </div> */}
                <h1 className="text-2xl font-bold sm:text-3xl">User Activity Overview</h1>
                {/* <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Choose a user and review their task and expense activity in the same calendar view users see.
                </p> */}
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="admin-calendar-user" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Select User
                </label>
                <select
                  id="admin-calendar-user"
                  value={selectedUserId ?? ''}
                  onChange={(event) => setSelectedUserId(event.target.value ? Number(event.target.value) : null)}
                  className="h-12 w-full border border-white/15 bg-white/10 px-4 text-sm font-medium text-white outline-none transition focus:border-sky-300"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="text-slate-900">
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4 bg-slate-50 px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              {/* <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Viewing Activity</p> */}
              <p className="mt-1 text-lg font-semibold text-blue-700">
                {selectedUser?.name || 'Select a user'}
              </p>
              {/* <p className="mt-1 text-sm text-slate-500">
                {selectedUser ? `${selectedUser.email} - ${selectedUser.status || 'inactive'}` : 'No user selected yet.'}
              </p> */}
            </div>
            <div className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              {isLoading ? 'Loading calendar data...' : 'Open any day to inspect detailed activity.'}
            </div>
          </div>
        </section>

        {selectedUserId !== null ? (
          <ActivityCalendar cursor={cursor} days={days} onCursorChange={setCursor} />
        ) : (
          <section className="border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
            No users found to display in the calendar.
          </section>
        )}
      </div>
    </AdminLayout>
  );
};
