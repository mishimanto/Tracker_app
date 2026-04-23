// frontend/src/App.tsx - Update with all routes
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';
import { PageLoader } from './components/UI/PageLoader';
import { siteSettingsService } from './services/siteSettingsService';
import { applyBrandingToDocument } from './utils/branding';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// User Pages
import { UserDashboard } from './pages/user/Dashboard';
import { Tasks } from './pages/user/Tasks';
import { Expenses } from './pages/user/Expenses';
import { AllExpensesPage } from './pages/user/AllExpensesPage';
import { Reports } from './pages/user/Reports';
import { Profile } from './pages/user/Profile';
import { ChangePassword } from './pages/user/ChangePassword';
import { Notepad } from './pages/user/Notepad';
import { Messages } from './pages/user/Messages';
import { CalendarPage } from './pages/user/CalendarPage';
import { SearchPage } from './pages/user/SearchPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { Users } from './pages/admin/Users';
import { AllTasks } from './pages/admin/AllTasks';
import { AllExpenses } from './pages/admin/AllExpenses';
import { AdminReports } from './pages/admin/Reports';
import { AdminActivityLogs } from './pages/admin/ActivityLogs';
import { AdminNotes } from './pages/admin/Notes';
import { AdminSettings } from './pages/admin/Settings';
import { Feedback } from './pages/admin/Feedback';
import { FeedbackDetail } from './pages/admin/FeedbackDetail';
import { AdminCalendarPage } from './pages/admin/CalendarPage';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; userOnly?: boolean }> = ({ 
  children, 
  adminOnly = false,
  userOnly = false,
}) => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader message="Authenticating..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (userOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader message="Loading..." />
      </div>
    );
  }
  
  if (isAuthenticated && ['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return <Navigate to={useAuthStore.getState().user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

// App Initializer
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setInitialized, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
      
      if (isAuthPage) {
        setInitialized(true);
        return;
      }
      
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          logout();
          setInitialized(true);
          return;
        }
        
        const userData = await authService.getUser();
        
        if (userData) {
          const user = userData.user || userData.data || userData;
          setUser(user);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [location.pathname]);

  return <>{children}</>;
};

const BrandingInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    applyBrandingToDocument(settings ?? null);
  }, [settings]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />
      <Router>
        <BrandingInitializer>
          <AppInitializer>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <AuthGuard>
                <Login />
              </AuthGuard>
            } />
            <Route path="/register" element={
              <AuthGuard>
                <Register />
              </AuthGuard>
            } />
            <Route path="/forgot-password" element={
              <AuthGuard>
                <ForgotPassword />
              </AuthGuard>
            } />
            
            {/* User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute userOnly>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute userOnly>
                <Tasks />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute userOnly>
                <Expenses />
              </ProtectedRoute>
            } />
            <Route path="/expenses-all" element={
              <ProtectedRoute userOnly>
                <AllExpensesPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute userOnly>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute userOnly>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute userOnly>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="/notepad" element={
              <ProtectedRoute userOnly>
                <Notepad />
              </ProtectedRoute>
            } />
            <Route path="/notepad/:noteId" element={
              <ProtectedRoute userOnly>
                <Notepad />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute userOnly>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/admin/calendar" element={
              <ProtectedRoute adminOnly>
                <AdminCalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/tasks" element={
              <ProtectedRoute adminOnly>
                <AllTasks />
              </ProtectedRoute>
            } />
            <Route path="/admin/expenses" element={
              <ProtectedRoute adminOnly>
                <AllExpenses />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute adminOnly>
                <AdminReports />
              </ProtectedRoute>
            } />
            <Route path="/admin/activity-logs" element={
              <ProtectedRoute adminOnly>
                <AdminActivityLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/notes" element={
              <ProtectedRoute adminOnly>
                <AdminNotes />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute adminOnly>
                <Feedback />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback/:id" element={
              <ProtectedRoute adminOnly>
                <FeedbackDetail />
              </ProtectedRoute>
            } />
            
            {/* Default Routes */}
            <Route path="/" element={<Navigate to={useAuthStore.getState().user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
            <Route path="*" element={<Navigate to={useAuthStore.getState().user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
            </Routes>
          </AppInitializer>
        </BrandingInitializer>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
