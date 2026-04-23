import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ExpenseChartProps {
  data?: any;
  type?: 'line' | 'bar' | 'pie';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, type = 'line' }) => {
  if (!data || !data.length) {
    return <div className="flex h-65 items-center justify-center border border-dashed border-slate-200 text-sm text-slate-400 animate-fade-in">No chart data available</div>;
  }

  return (
    <div className="h-65 sm:h-75 animate-fade-in">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
        .recharts-wrapper * {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" isAnimationActive={true} animationDuration={800} />
          </LineChart>
        )}
        {type === 'bar' && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
            <Legend />
            <Bar dataKey="amount" fill="#3b82f6" isAnimationActive={true} animationDuration={800} />
          </BarChart>
        )}
        {type === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              isAnimationActive={true}
              animationDuration={800}
            >
              {data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
