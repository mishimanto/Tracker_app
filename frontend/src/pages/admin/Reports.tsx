import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { PageLoaderTransition } from '../../components/UI/PageLoader';

export const AdminReports: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingUserId, setDownloadingUserId] = useState<number | null>(null);
  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: adminService.getReports,
  });
  const topUsers = Array.isArray(reports?.top_users) ? reports.top_users : [];

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await adminService.downloadReport('monthly');
      toast.success('Admin report downloaded.');
    } catch (error) {
      toast.error('Failed to download report.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUserReportDownload = async (userId: number) => {
    try {
      setDownloadingUserId(userId);
      await adminService.downloadUserReport(userId, 'monthly');
      toast.success('User report downloaded.');
    } catch (error) {
      toast.error('Failed to download user report.');
    } finally {
      setDownloadingUserId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        
          {reports && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">User Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Total Users</span>
                    <span className="text-sm font-semibold text-slate-900">{reports.totalUsers}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Active Users</span>
                    <span className="text-sm font-semibold text-emerald-700">{reports.activeUsers}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-slate-600">Inactive Users</span>
                    <span className="text-sm font-semibold text-red-600">{reports.inactiveUsers}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Task Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Total Tasks</span>
                    <span className="text-sm font-semibold text-slate-900">{reports.totalTasks}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Completed</span>
                    <span className="text-sm font-semibold text-emerald-700">{reports.completedTasks}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-slate-600">Pending</span>
                    <span className="text-sm font-semibold text-amber-600">{reports.pendingTasks}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Expense Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Total Expenses</span>
                    <span className="text-sm font-semibold text-slate-900">${reports.totalExpenses}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">This Month</span>
                    <span className="text-sm font-semibold text-blue-700">${reports.monthlyExpenses}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-slate-600">Average Per User</span>
                    <span className="text-sm font-semibold text-purple-700">${reports.avgExpensePerUser}</span>
                  </div>
                </div>
              </div>

              {/* <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">User Reports</h3>
                  <span className="text-sm text-slate-500">
                    Admin এখান থেকে নির্দিষ্ট user-এর activity report download করতে পারবে
                  </span>
                </div>
                <div className="space-y-3">
                  {topUsers.map((user) => (
                    <div key={user.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          Tasks: {user.tasks_count || 0}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          Expenses: ${Number(user.expenses_sum_amount || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUserReportDownload(user.id)}
                          disabled={downloadingUserId === user.id}
                          className="rounded-full bg-slate-900 px-4 py-1.5 text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          {downloadingUserId === user.id ? 'Generating...' : 'Download User Report'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {topUsers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      No user report data available yet.
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          )}
        
      </div>
    </AdminLayout>
  );
};
