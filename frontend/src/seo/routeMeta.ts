interface RouteMetaDefinition {
  path?: string;
  title: string;
  description: string;
  robots?: string;
  includeInSitemap?: boolean;
  prerender?: boolean;
}

const defaultMeta: RouteMetaDefinition = {
  title: 'Smart task, expense, and note management',
  description:
    'Manage tasks, expenses, notes, reports, and daily activity from one streamlined productivity dashboard.',
};

export const publicSeoRoutes: RouteMetaDefinition[] = [
  {
    path: '/',
    title: 'Task, Expense, Report, and Notes Workspace',
    description: 'Explore the platform features, then sign in or register to use task tracking, expenses, reports, calendar, notes, and reminders.',
    includeInSitemap: true,
    prerender: true,
  },
  {
    path: '/login',
    title: 'Sign In',
    description: 'Sign in to access your tasks, expense tracking, reports, notes, and calendar tools.',
    includeInSitemap: true,
    prerender: true,
  },
  {
    path: '/register',
    title: 'Create Account',
    description: 'Create your account to organize tasks, expenses, reports, notes, and daily productivity.',
    includeInSitemap: true,
    prerender: true,
  },
  {
    path: '/forgot-password',
    title: 'Reset Password',
    description: 'Reset your password securely and regain access to your account and productivity tools.',
    robots: 'noindex, nofollow',
    prerender: true,
  },
  {
    title: 'Choose New Password',
    description: 'Create a new secure password to restore access to your account.',
    robots: 'noindex, nofollow',
  },
];

const routeMeta: Array<{ match: (pathname: string) => boolean; meta: RouteMetaDefinition }> = [
  {
    match: (pathname) => pathname === '/',
    meta: publicSeoRoutes[0],
  },
  {
    match: (pathname) => pathname === '/login',
    meta: publicSeoRoutes[1],
  },
  {
    match: (pathname) => pathname === '/register',
    meta: publicSeoRoutes[2],
  },
  {
    match: (pathname) => pathname === '/forgot-password',
    meta: publicSeoRoutes[3],
  },
  {
    match: (pathname) => pathname.startsWith('/password-reset/'),
    meta: publicSeoRoutes[4],
  },
  {
    match: (pathname) => pathname === '/dashboard',
    meta: {
      title: 'User Dashboard',
      description: 'Review your latest tasks, spending trends, and recent activity from one dashboard.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/tasks',
    meta: {
      title: 'Task Manager',
      description: 'Create, organize, and track pending, completed, and overdue tasks efficiently.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/expenses' || pathname === '/expenses-all',
    meta: {
      title: 'Expense Tracker',
      description: 'Track expenses, review spending patterns, and manage categories with clarity.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/reports',
    meta: {
      title: 'Reports',
      description: 'Analyze task completion and expense performance through clean, exportable reports.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/calendar',
    meta: {
      title: 'Calendar',
      description: 'See tasks and expenses on a monthly calendar and open each day for detailed activity.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/search',
    meta: {
      title: 'Global Search',
      description: 'Search tasks and expenses quickly with filters for categories, priorities, and dates.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname.startsWith('/notepad'),
    meta: {
      title: 'Notepad',
      description: 'Create and manage notes in a focused workspace built for fast writing and updates.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/messages',
    meta: {
      title: 'Messages',
      description: 'Read updates and communicate through your in-app message center.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/profile',
    meta: {
      title: 'Profile',
      description: 'Manage your account profile details and personal preferences.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/change-password',
    meta: {
      title: 'Change Password',
      description: 'Update your account password to keep your data secure.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname === '/admin',
    meta: {
      title: 'Admin Dashboard',
      description: 'Monitor platform users, activity, expenses, tasks, and system-wide insights.',
      robots: 'noindex, nofollow',
    },
  },
  {
    match: (pathname) => pathname.startsWith('/admin/'),
    meta: {
      title: 'Admin Panel',
      description: 'Manage users, tasks, expenses, settings, and platform activity from the admin panel.',
      robots: 'noindex, nofollow',
    },
  },
];

export const getRouteMeta = (pathname: string): RouteMetaDefinition => {
  return routeMeta.find((entry) => entry.match(pathname))?.meta ?? defaultMeta;
};
