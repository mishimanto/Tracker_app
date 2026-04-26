import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';
import { PageLoader } from './components/UI/PageLoader';
import { siteSettingsService } from './services/siteSettingsService';
import { applyBrandingToDocument } from './utils/branding';
import { SeoInitializer } from './components/SEO/SeoInitializer';

const lazyNamed = <T extends Record<string, unknown>>(
  factory: () => Promise<T>,
  exportName: keyof T
) =>
  lazy(async () => {
    const module = await factory();
    return { default: module[exportName] as React.ComponentType };
  });

const Landing = lazyNamed(() => import('./pages/public/Landing'), 'Landing');
const Login = lazyNamed(() => import('./pages/auth/Login'), 'Login');
const Register = lazyNamed(() => import('./pages/auth/Register'), 'Register');
const ForgotPassword = lazyNamed(() => import('./pages/auth/ForgotPassword'), 'ForgotPassword');
const ResetPassword = lazyNamed(() => import('./pages/auth/ResetPassword'), 'ResetPassword');
const UserDashboard = lazyNamed(() => import('./pages/user/Dashboard'), 'UserDashboard');
const Tasks = lazyNamed(() => import('./pages/user/Tasks'), 'Tasks');
const Expenses = lazyNamed(() => import('./pages/user/Expenses'), 'Expenses');
const AllExpensesPage = lazyNamed(() => import('./pages/user/AllExpensesPage'), 'AllExpensesPage');
const Reports = lazyNamed(() => import('./pages/user/Reports'), 'Reports');
const Profile = lazyNamed(() => import('./pages/user/Profile'), 'Profile');
const ChangePassword = lazyNamed(() => import('./pages/user/ChangePassword'), 'ChangePassword');
const Notepad = lazyNamed(() => import('./pages/user/Notepad'), 'Notepad');
const Messages = lazyNamed(() => import('./pages/user/Messages'), 'Messages');
const CalendarPage = lazyNamed(() => import('./pages/user/CalendarPage'), 'CalendarPage');
const SearchPage = lazyNamed(() => import('./pages/user/SearchPage'), 'SearchPage');
const AdminDashboard = lazyNamed(() => import('./pages/admin/Dashboard'), 'AdminDashboard');
const Users = lazyNamed(() => import('./pages/admin/Users'), 'Users');
const AllTasks = lazyNamed(() => import('./pages/admin/AllTasks'), 'AllTasks');
const AllExpenses = lazyNamed(() => import('./pages/admin/AllExpenses'), 'AllExpenses');
const AdminReports = lazyNamed(() => import('./pages/admin/Reports'), 'AdminReports');
const AdminActivityLogs = lazyNamed(() => import('./pages/admin/ActivityLogs'), 'AdminActivityLogs');
const AdminNotes = lazyNamed(() => import('./pages/admin/Notes'), 'AdminNotes');
const AdminSettings = lazyNamed(() => import('./pages/admin/Settings'), 'AdminSettings');
const Feedback = lazyNamed(() => import('./pages/admin/Feedback'), 'Feedback');
const FeedbackDetail = lazyNamed(() => import('./pages/admin/FeedbackDetail'), 'FeedbackDetail');
const AdminCalendarPage = lazyNamed(() => import('./pages/admin/CalendarPage'), 'AdminCalendarPage');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const RouteFallback: React.FC<{ message?: string }> = ({ message = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <PageLoader message={message} />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; userOnly?: boolean }> = ({
  children,
  adminOnly = false,
  userOnly = false,
}) => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <RouteFallback message="Loading..." />;
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

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return <RouteFallback message="Loading..." />;
  }

  if (isAuthenticated && ['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return <Navigate to={useAuthStore.getState().user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setInitialized, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

        if (!token) {
          logout();
          setInitialized(true);
          return;
        }

        if (isAuthPage && useAuthStore.getState().user) {
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
  }, []);

  return <>{children}</>;
};

const BrandingInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 10,
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
          <SeoInitializer />
          <AppInitializer>

            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <Landing />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <AuthGuard>
                      <Login />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthGuard>
                      <Register />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <AuthGuard>
                      <ForgotPassword />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/password-reset/:token"
                  element={
                    <AuthGuard>
                      <ResetPassword />
                    </AuthGuard>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute userOnly>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute userOnly>
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute userOnly>
                      <Expenses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses-all"
                  element={
                    <ProtectedRoute userOnly>
                      <AllExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute userOnly>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute userOnly>
                      <CalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute userOnly>
                      <SearchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notepad"
                  element={
                    <ProtectedRoute userOnly>
                      <Notepad />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notepad/:noteId"
                  element={
                    <ProtectedRoute userOnly>
                      <Notepad />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute userOnly>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/calendar"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminCalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tasks"
                  element={
                    <ProtectedRoute adminOnly>
                      <AllTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/expenses"
                  element={
                    <ProtectedRoute adminOnly>
                      <AllExpenses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/activity-logs"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminActivityLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notes"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminNotes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/feedback"
                  element={
                    <ProtectedRoute adminOnly>
                      <Feedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/feedback/:id"
                  element={
                    <ProtectedRoute adminOnly>
                      <FeedbackDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={<Navigate to={useAuthStore.getState().user?.role === 'admin' ? '/admin' : '/'} replace />}
                />
              </Routes>
            </Suspense>

          </AppInitializer>
        </BrandingInitializer>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
