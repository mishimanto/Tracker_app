import React from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  variant?: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', message, onClose }) => {
  const variants = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
  };

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5" />,
    error: <ExclamationCircleIcon className="w-5 h-5" />,
    info: <InformationCircleIcon className="w-5 h-5" />,
    warning: <ExclamationCircleIcon className="w-5 h-5" />,
  };

  return (
    <div className={`rounded-lg p-4 flex items-center justify-between ${variants[variant]}`}>
      <div className="flex items-center gap-3">
        {icons[variant]}
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      )}
    </div>
  );
};
