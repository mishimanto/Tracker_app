import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { resolveBrandingAssetUrl } from '../../utils/branding';

export const FeedbackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState('');

  const messageId = Number(id);

  const { data: feedbackMessage, isLoading } = useQuery({
    queryKey: ['admin-feedback-message', messageId],
    queryFn: () => adminService.getFeedbackMessage(messageId),
    enabled: Number.isFinite(messageId),
  });

  const sendReplyMutation = useMutation({
    mutationFn: ({ targetId, message }: { targetId: number; message: string }) =>
      adminService.replyToFeedback(targetId, message),
    onSuccess: async () => {
      toast.success('Reply email sent to the user.');
      setReplyMessage('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-feedback-messages'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-feedback-messages-live'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-feedback-message', messageId] }),
      ]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send reply email.');
    },
  });

  const screenshotUrl = resolveBrandingAssetUrl(feedbackMessage?.screenshot_path);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/admin/feedback" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Inbox
            </Link>
            {/* <h1 className="mt-3 text-3xl font-bold text-slate-900">Message Details</h1>
            <p className="mt-1 text-sm text-slate-500">Review the full message and send a reply to the user email from this page.</p> */}
          </div>
          {feedbackMessage && (
            <span className={`w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              feedbackMessage.status === 'replied'
                ? 'bg-emerald-100 text-emerald-700'
                : feedbackMessage.status === 'read'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-blue-100 text-blue-700'
            }`}>
              {feedbackMessage.status}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading message...
          </div>
        ) : !feedbackMessage ? (
          <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Message not found.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">Subject</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{feedbackMessage.subject}</h2>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className='mb-3'>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">From</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{feedbackMessage.user?.name || 'Unknown user'}</p>
                    {/* <p className="mt-1 text-sm text-slate-500">{feedbackMessage.user?.email}</p> */}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Received</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {new Date(feedbackMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Message</p>
                  <div className="mt-3 border border-slate-200 bg-white p-3 text-sm leading-7 text-slate-700 whitespace-pre-line">
                    {feedbackMessage.message}
                  </div>
                </div>

                {screenshotUrl && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Attachment</p>
                    <a href={screenshotUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <img src={screenshotUrl} alt="Attachment" className="max-h-105 w-full object-contain" />
                    </a>
                  </div>
                )}
              </div>
            </section>

            <aside className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Send Email</p> */}
                <h3 className="my-2 text-xl font-bold text-slate-900">Reply to <span className='text-blue-600'>{feedbackMessage.user?.name || 'user'}</span></h3>
                <p className="text-sm text-slate-500">
                  Email: {feedbackMessage.user?.email || 'the registered user email'}.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <textarea
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  rows={12}
                  placeholder="Write your reply email here..."
                  className="w-full resize-none border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!replyMessage.trim()) {
                      toast.error('Reply message is required.');
                      return;
                    }

                    sendReplyMutation.mutate({ targetId: feedbackMessage.id, message: replyMessage.trim() });
                  }}
                  disabled={sendReplyMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2  bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {sendReplyMutation.isPending ? 'Sending Email...' : 'Send Email'}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
