import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueueListIcon } from '@heroicons/react/24/outline';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';

export const AdminActivityLogs: React.FC = () => {
  const { data: logs = [] } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: adminService.getActivityLogs,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-sky-900 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <QueueListIcon className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">User Activity Logs</h1>
                {/* <p className="mt-1 text-sm text-slate-300">
                  Track logins, expense creation, and delete actions across the system.
                </p> */}
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No activity logs found yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{log.description} <span className="text-xs uppercase tracking-[0.14em] text-slate-400">({log.action.replace(/_/g, ' ')})</span></p>
                        <p className="text-sm text-slate-500">
                          {/* By: {log.actor?.name || 'System'}
                          {log.target_user && log.target_user.id !== log.actor?.id ? ` | Target: ${log.target_user.name}` : ''} */}
                          {log.ip_address && <p className="mt-1 text-xs text-slate-400">IP: {log.ip_address}</p>}
                        </p>
                        {/* <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                          {log.action.replace(/_/g, ' ')}
                        </p> */}
                      </div>

                      <div className="text-sm text-slate-500 md:text-right">
                        <p>{new Date(log.created_at).toLocaleString()}</p>
                        
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};
