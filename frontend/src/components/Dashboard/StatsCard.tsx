import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'emerald' | 'amber' | 'indigo';
}

const colorConfig = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-700',
    valueColor: 'text-blue-900',
    border: 'border-blue-200/60',
  },
  green: {
    bg: 'from-emerald-50 to-emerald-100',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-700',
    valueColor: 'text-emerald-900',
    border: 'border-emerald-200/60',
  },
  emerald: {
    bg: 'from-emerald-50 to-emerald-100',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-700',
    valueColor: 'text-emerald-900',
    border: 'border-emerald-200/60',
  },
  orange: {
    bg: 'from-orange-50 to-orange-100',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-700',
    valueColor: 'text-orange-900',
    border: 'border-orange-200/60',
  },
  red: {
    bg: 'from-red-50 to-red-100',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    titleColor: 'text-red-700',
    valueColor: 'text-red-900',
    border: 'border-red-200/60',
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-700',
    valueColor: 'text-purple-900',
    border: 'border-purple-200/60',
  },
  amber: {
    bg: 'from-amber-50 to-amber-100',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-700',
    valueColor: 'text-amber-900',
    border: 'border-amber-200/60',
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    titleColor: 'text-indigo-700',
    valueColor: 'text-indigo-900',
    border: 'border-indigo-200/60',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'blue',
}) => {
  const config = colorConfig[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-md border ${config.border} bg-gradient-to-br ${config.bg} p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${config.titleColor}`}>
            {title}
          </p>
          <p className={`mt-2 font-bold text-sm sm:text-2xl ${config.valueColor} truncate`}>
            {value}
          </p>
          {subtitle && (
            <p className={`mt-1 text-xs ${config.titleColor} opacity-80`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={`mt-1.5 text-xs font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`shrink-0 rounded-xl ${config.iconBg} p-2.5 ${config.iconColor} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
