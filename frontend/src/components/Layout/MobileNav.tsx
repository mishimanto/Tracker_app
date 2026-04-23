import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export const MobileNav: React.FC = () => {
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1 p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center rounded-lg p-2 ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="mt-1 text-xs">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
