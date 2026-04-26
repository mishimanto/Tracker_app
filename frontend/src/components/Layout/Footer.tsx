import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsService } from '../../services/siteSettingsService';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });
  const brandName = settings?.site_name?.trim() || 'Task & Expense Tracker';

  return (
    <footer className="border-t border-gray-200 bg-gray-50/90 py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-center sm:px-6 sm:text-left lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-sm text-gray-600">
          &copy; {currentYear} <span className="font-semibold">{brandName}</span>. All rights reserved.
        </p>
        <p className="text-xs text-gray-500">
          Secure workspace for tasks, expenses, and reports.
        </p>
      </div>
    </footer>
  );
};
