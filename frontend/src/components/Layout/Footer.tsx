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
    <footer className="hidden lg:block bg-gray-50 border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

        <p className="text-sm text-gray-600">
          &copy; {currentYear} <span className="font-semibold">{brandName}</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
