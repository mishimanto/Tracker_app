import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';

export const Feedback: React.FC = () => {
  const { data: feedbackMessages = [], isLoading } = useQuery({
    queryKey: ['admin-feedback-messages'],
    queryFn: adminService.getFeedbackMessages,
    refetchInterval: 5000,
    staleTime: 0,
  });
  const unreadCount = feedbackMessages.filter((item) => item.status === 'unread').length;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Admin Inbox</p> */}
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Inbox</h1>
            {/* <p className="mt-1 text-sm text-slate-500">All user messages stay here like a normal inbox. Open any message to view details and send email.</p> */}
          </div>
          {/* <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Live Status</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{unreadCount}</p>
            <p className="text-sm text-slate-500">Unread messages</p>
          </div> */}
        </div>

        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_140px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Sender</span>
            <span>Subject</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          <div className="divide-y divide-slate-200">
            {isLoading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Loading inbox...</div>
            ) : feedbackMessages.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">No messages yet.</div>
            ) : (
              feedbackMessages.map((item) => (
                <Link
                  key={item.id}
                  to={`/admin/feedback/${item.id}`}
                  className={`grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_140px_120px] gap-4 px-6 py-5 transition hover:bg-slate-50 ${
                    item.status === 'unread' ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        item.status === 'unread' ? 'bg-blue-600' : item.status === 'replied' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.user?.name || 'Unknown user'}
                      </p>
                    </div>
                    {/* <p className="mt-1 truncate pl-5 text-sm text-slate-500">{item.user?.email}</p> */}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.subject}</p>
                    {/* <p className="mt-1 truncate text-sm text-slate-500">{item.message}</p> */}
                  </div>
                  <div className="flex items-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      item.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'read'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
