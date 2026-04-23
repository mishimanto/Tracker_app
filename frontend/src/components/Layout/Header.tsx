import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { siteSettingsService } from '../../services/siteSettingsService';
import { adminService } from '../../services/adminService';
import { notificationService } from '../../services/notificationService';
import { AppNotification } from '../../types';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  variant?: 'user' | 'admin';
}

const getProfileImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
  return `${baseUrl}/storage/${path}`;
};

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen, variant = 'user' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const seenNotifications = useRef<Set<string>>(new Set());
  const hasHydratedNotifications = useRef(false);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });

  const { data: adminMessages = [] } = useQuery({
    queryKey: ['admin-feedback-messages-live'],
    queryFn: adminService.getFeedbackMessages,
    enabled: variant === 'admin',
    refetchInterval: 15000,
    staleTime: 0,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    enabled: variant === 'user',
    refetchInterval: 15000,
    staleTime: 0,
  });

  const normalizedNotifications = useMemo(() => {
    if (variant === 'admin') {
      return adminMessages.slice(0, 6).map((item) => ({
        id: String(item.id),
        title: item.subject,
        message: item.user?.name ? `From ${item.user.name}` : 'New feedback message',
        createdAt: item.created_at,
        unread: item.status === 'unread',
        action: () => navigate(`/admin/feedback/${item.id}`),
      }));
    }

    return notifications.slice(0, 6).map((item: AppNotification) => ({
      id: item.id,
      title: item.data?.title || 'Notification',
      message: item.data?.message || item.data?.subject || 'You have an update.',
      createdAt: item.created_at,
      unread: !item.read_at,
      action: () => {
        if (item.data?.task_id) {
          navigate('/tasks');
          return;
        }
        if (item.data?.feedback_id) {
          navigate('/messages');
          return;
        }
        if (item.data?.category_id) {
          navigate('/expenses');
          return;
        }
        navigate('/dashboard');
      },
    }));
  }, [adminMessages, navigate, notifications, variant]);

  const unreadCount = normalizedNotifications.filter((item) => item.unread).length;
  const userName = user?.name?.trim() || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const profilePhotoUrl = getProfileImageUrl(user?.profile_photo_path);
  const brandName = settings?.site_name?.trim() || 'Task & Expense';

  useEffect(() => {
    if (variant !== 'user') {
      return;
    }

    if (!hasHydratedNotifications.current) {
      notifications.forEach((item) => {
        seenNotifications.current.add(item.id);
      });
      hasHydratedNotifications.current = true;
      return;
    }

    for (const item of notifications) {
      if (!item.read_at && !seenNotifications.current.has(item.id)) {
        seenNotifications.current.add(item.id);
        toast(item.data?.title || 'New notification', {
          icon: item.data?.kind === 'budget_exceeded' ? '!' : item.data?.kind === 'feedback_reply' ? '@' : '*',
        });
      }
    }
  }, [notifications, variant]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = searchText.trim();
    if (!value) return;
    navigate(`/search?query=${encodeURIComponent(value)}`);
  };

  const handleMarkAllRead = async () => {
    if (variant !== 'user') return;
    await notificationService.markAllRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center gap-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-3 lg:hidden">
          <span className="text-lg font-bold text-slate-900">{brandName}</span>
        </div>

        <form onSubmit={handleSearch} className="hidden max-w-xl flex-1 lg:block">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Global search: expense, category, task priority, due date..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {variant === 'admin' && (
            <p className="hidden truncate text-sm font-semibold text-blue-600/80 xl:block">
              Control Center
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate(variant === 'admin' ? '/admin/calendar' : '/calendar')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
            title="Calendar view"
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>

          <Menu as="div" className="relative">
            <Menu.Button className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
              <span className="sr-only">Open notifications</span>
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-20 mt-2 w-96 origin-top-right rounded-lg border border-slate-200 bg-white p-2 shadow-xl focus:outline-none">
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    {/* <p className="text-sm font-semibold text-slate-900">Notifications</p> */}
                    <p className="text-xs text-slate-500">
                      {unreadCount > 0 ? `${unreadCount} unread items` : 'Everything is up to date'}
                    </p>
                  </div>
                  {variant === 'user' ? (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-sky-600"
                    >
                      Mark all read
                    </button>
                  ) : (
                    <Link to="/admin/feedback" className="text-xs font-semibold text-sky-600">
                      Open Inbox
                    </Link>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {normalizedNotifications.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    normalizedNotifications.map((item) => (
                      <Menu.Item key={item.id}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={item.action}
                            className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ${
                              active ? 'bg-slate-50' : ''
                            }`}
                          >
                            <span
                              className={`mt-2 h-2.5 w-2.5 rounded-full ${
                                item.unread ? 'bg-sky-500' : 'bg-slate-300'
                              }`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <span className="block truncate text-sm font-semibold text-slate-900">
                                  {item.title}
                                </span>
                                <span className="shrink-0 text-[11px] text-slate-400">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </span>
                              <span className="mt-1 block text-sm text-slate-500">
                                {item.message}
                              </span>
                            </span>
                          </button>
                        )}
                      </Menu.Item>
                    ))
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" />

          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-600 text-sm font-semibold text-white">
                    {userInitial}
                  </div>
                )}
                <span className="ml-3 hidden text-sm font-semibold leading-6 text-slate-900 lg:block">
                  {userName}
                </span>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-2xl bg-white py-2 shadow-lg ring-1 ring-slate-900/5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile')}
                      className={`${active ? 'bg-slate-50' : ''} block w-full px-4 py-2 text-left text-sm text-slate-900`}
                    >
                      My Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/change-password')}
                      className={`${active ? 'bg-slate-50' : ''} block w-full px-4 py-2 text-left text-sm text-slate-900`}
                    >
                      Change Password
                    </button>
                  )}
                </Menu.Item>
                {variant === 'admin' && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/admin/settings')}
                        className={`${active ? 'bg-slate-50' : ''} block w-full px-4 py-2 text-left text-sm text-slate-900`}
                      >
                        Site Settings
                      </button>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${active ? 'bg-slate-50' : ''} block w-full px-4 py-2 text-left text-sm text-red-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};
  
