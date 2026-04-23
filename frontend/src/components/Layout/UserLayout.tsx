import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex-1 flex flex-col">
        <Header setSidebarOpen={setSidebarOpen} variant="user" />
        <main className="py-6 pb-20 lg:pb-6 flex-1">
          <div className="mx-auto px-4 sm:px-4 lg:px-6">
            {children}
          </div>
        </main>
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
};
