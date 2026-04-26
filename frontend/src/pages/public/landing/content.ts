import {
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { C } from './theme';

export const features = [
  {
    title: 'Task Pipeline',
    desc: 'Visualize work in motion - pending, active, completed, overdue. Drag-and-drop boards with smart filters and deadline tracking built in.',
    icon: ClipboardDocumentListIcon,
    span: 2,
    accent: C.accent,
    tag: 'Core',
    href: '/tasks',
    action: 'Open tasks',
  },
  {
    title: 'Expenses',
    desc: 'Log spend, set budgets, and watch real-time summaries update as you go.',
    icon: CurrencyDollarIcon,
    span: 1,
    accent: C.violet,
    tag: 'Finance',
    href: '/expenses',
    action: 'Open expenses',
  },
  {
    title: 'Visual Reports',
    desc: 'Beautiful charts and exportable summaries, built directly into your workspace.',
    icon: ChartBarIcon,
    span: 1,
    accent: C.cyan,
    tag: 'Insights',
    href: '/reports',
    action: 'Open reports',
  },
  {
    title: 'Calendar',
    desc: 'Every deadline and activity in one unified, intuitive timeline.',
    icon: CalendarDaysIcon,
    span: 1,
    accent: C.accent,
    tag: 'Planning',
    href: '/calendar',
    action: 'Open calendar',
  },
  {
    title: 'Smart Notes',
    desc: 'Quick capture for ideas, reminders, and daily references with markdown support.',
    icon: DocumentTextIcon,
    span: 1,
    accent: C.violet,
    tag: 'Capture',
    href: '/notepad',
    action: 'Open notes',
  },
];

export const steps = [
  {
    num: '01',
    title: 'Create your account',
    desc: 'Sign up in under 30 seconds. Just your email - no credit card, no commitment.',
    icon: BoltIcon,
    color: C.accent,
  },
  {
    num: '02',
    title: 'Build your workspace',
    desc: 'Add tasks, log expenses, and shape your dashboard exactly how you think.',
    icon: ClipboardDocumentListIcon,
    color: C.violet,
  },
  {
    num: '03',
    title: 'Stay ahead',
    desc: 'Reports, calendar, and alerts keep you well ahead of every deadline.',
    icon: CheckCircleIcon,
    color: C.cyan,
  },
];

export const testimonials = [
  {
    name: 'Moynul Islam Shimanto',
    role: 'Project Manager',
    quote: 'This replaced three separate tools for our team. The unified task and expense view alone saved us hours every week. The reports are exactly what stakeholders need.',
    initials: 'SC',
    rating: 5,
    accent: C.accent,
  },
  {
    name: 'MD Ripon Hossain',
    role: 'Freelancer',
    quote: "Clean, fast, and doesn't get in the way. Exactly what I needed to stay on top of client projects and invoices. The calendar view is a game-changer for billing.",
    initials: 'MJ',
    rating: 5,
    accent: C.violet,
  },
  {
    name: 'MD Yousuf Shah',
    role: 'Database Administrator',
    quote: 'We onboarded our entire team in under 10 minutes. The reports are now our single source of truth for investor updates. Absolutely love the design.',
    initials: 'ER',
    rating: 5,
    accent: C.cyan,
  },
];

export const marqueeWords = [
  'Task Management',
  'Expense Tracking',
  'Visual Reports',
  'Schedule Calendar',
  'Smart Alerts',
  'Personal Notes',
  'Budget Analysis',
  'Deadline Tracking',
  'Productivity Suite',
  'Real-time Sync',
  'User Support',
];

export const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Expenses', to: '/expenses' },
      { label: 'Reports', to: '/reports' },
      { label: 'Calendar', to: '/calendar' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Features', to: '#features' },
      { label: 'How It Works', to: '#how-it-works' },
      { label: 'Testimonials', to: '#testimonials' },
    ],
  },
];
