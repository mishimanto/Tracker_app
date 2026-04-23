import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../../services/expenseService';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ExpenseStats: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['expense-stats', period],
    queryFn: () => expenseService.getExpenseStats(period),
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-96 -lg"></div>;
  }

  if (!stats) return null;

  const categoryData = stats.by_category.map((cat) => ({
    name: cat.category.name,
    value: parseFloat(cat.total.toString()),
    color: cat.category.color || '#0088FE',
  }));

  const paymentMethodData = stats.by_payment_method.map((pm) => ({
    name: pm.payment_method.charAt(0).toUpperCase() + pm.payment_method.slice(1),
    value: parseFloat(pm.total.toString()),
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Expense Statistics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Total Expense Card */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 -lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Expenses</p>
            <p className="text-3xl font-bold mt-1">
              BDT {parseFloat(stats.total.toString()).toFixed(2)}
            </p>
          </div>
          <CurrencyDollarIcon className="h-12 w-12 opacity-50" />
        </div>
        {period === 'monthly' && stats.daily_average > 0 && (
          <p className="text-sm mt-2 opacity-90">
            Daily Average: BDT {stats.daily_average.toFixed(2)}
          </p>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white -lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `BDT ${parseFloat((value || 0).toString()).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white -lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Methods
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `BDT ${parseFloat((value || 0).toString()).toFixed(2)}`} />
              <Bar dataKey="value" fill="#8884d8">
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Breakdown (Monthly View) */}
      {period === 'monthly' && stats.daily_breakdown && (
        <div className="bg-white -lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Daily Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).getDate().toString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: any) => `BDT ${parseFloat((value || 0).toString()).toFixed(2)}`}
              />
              <Bar dataKey="total" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Breakdown (Yearly View) */}
      {period === 'yearly' && stats.monthly_breakdown && (
        <div className="bg-white -lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthly_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(month) => new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(month) => new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                formatter={(value: any) => `BDT ${parseFloat((value || 0).toString()).toFixed(2)}`}
              />
              <Bar dataKey="total" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};