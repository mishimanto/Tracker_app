import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { UserLayout } from '../../components/Layout/UserLayout';
import { feedbackService } from '../../services/feedbackService';
import { siteSettingsService } from '../../services/siteSettingsService';

export const Messages: React.FC = () => {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    subject: '',
    message: '',
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });

  const feedbackMutation = useMutation({
    mutationFn: feedbackService.sendFeedback,
    onSuccess: () => {
      toast.success('Your message was sent to the admin inbox.');
      setFeedbackForm({ subject: '', message: '' });
      setScreenshot(null);
      setScreenshotPreview(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send message.';
      toast.error(message);
    },
  });

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    const formData = new FormData();
    formData.append('subject', feedbackForm.subject.trim());
    formData.append('message', feedbackForm.message.trim());
    if (screenshot) formData.append('screenshot', screenshot);
    feedbackMutation.mutate(formData as any);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Feedback & Support</h2>
              {/* <p className="mt-1 text-sm text-slate-500">Send a message directly to our admin team.</p> */}
            </div>
            {siteSettings?.support_email && (
              <p className="text-sm text-slate-500">
                Support email: <span className="font-semibold text-slate-700">{siteSettings.support_email}</span>
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Subject</span>
                <input
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                  className="w-full border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 outline-none"
                  placeholder="Subject of your message"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Message</span>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  rows={6}
                  className="w-full resize-none border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 outline-none"
                  placeholder="Details of your request or feedback..."
                />
              </label>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Screenshot (Optional)</span>
                <div className="flex items-center gap-4">
                  <label className="flex flex-1 cursor-pointer items-center justify-center border border-dashed border-slate-300 py-3 transition hover:bg-slate-50">
                    <div className="flex py-3 items-center gap-2 text-slate-500">
                      <PaperClipIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">Attach Image</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                  </label>
                  {screenshotPreview && (
                    <div className="relative h-17 w-17 border border-slate-200">
                      <img src={screenshotPreview} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                      > × </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackMutation.isPending}
                  className="bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {feedbackMutation.isPending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4 bg-slate-950 p-6 text-slate-100">
              <div>
                <p className="text-md uppercase tracking-[0.24em] text-slate-400">Information</p>
                {/* <h3 className="mt-2 text-xl font-semibold">Admin Inbox</h3> */}
              </div>
              <div className="text-sm grid gap-4 text-slate-300">
                <p>You can use this to report bugs, request features, or ask for support.</p>
                <p>Your message goes to the Support panel, and our support team member will reply to your registered email address.</p>
                <p>Thank You.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
};
