import React from 'react';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { StatsCard } from '../Dashboard/StatsCard';

interface StatCardsProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  stats: {
    total: number;
    entries: number;
    average: number;
    topCategory: string;
  };
}

export const ExpenseStatCards: React.FC<StatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mt-3">
      <StatsCard
        title="Total Spent"
        value={`BDT ${Number(stats.total || 0).toFixed(2)}`}
        icon={<CurrencyDollarIcon className="h-5 w-5" />}
        color="emerald"
      />
      <StatsCard
        title="Transactions"
        value={stats.entries.toString()}
        icon={<CheckCircleIcon className="h-5 w-5" />}
        color="blue"
      />
      <StatsCard
        title="Average"
        value={`BDT ${Number(stats.average || 0).toFixed(2)}`}
        icon={<ShoppingBagIcon className="h-5 w-5" />}
        color="purple"
      />
      <StatsCard
        title="Top Category"
        value={stats.topCategory}
        icon={<SparklesIcon className="h-5 w-5" />}
        color="amber"
      />
    </div>
  );
};
