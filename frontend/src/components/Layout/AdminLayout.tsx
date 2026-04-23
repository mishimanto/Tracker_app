import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72 flex-1 flex flex-col">
        <Header setSidebarOpen={setSidebarOpen} variant="admin" />
        <main className="py-6 flex-1">
          <div className="mx-auto px-3 sm:px-4 lg:px-6">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};
