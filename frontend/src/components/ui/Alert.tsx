import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  suggestion?: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  suggestion,
  onClose,
  className = '',
}) => {
  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
      titleColor: 'text-red-800',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      titleColor: 'text-amber-800',
    },
    info: {
      bg: 'bg-[#E7F5F2] border-[#2B8C87]/30 text-[#0B1F35]',
      icon: <Info className="w-5 h-5 text-[#2B8C87] shrink-0" />,
      titleColor: 'text-[#142D4E]',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
      titleColor: 'text-emerald-800',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 flex gap-3 transition-all ${styles.bg} ${className}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1 text-sm">
        {title && <h4 className={`font-semibold mb-1 ${styles.titleColor}`}>{title}</h4>}
        <p className="leading-relaxed">{message}</p>
        {suggestion && (
          <p className="mt-2 text-xs opacity-90 font-medium bg-white/60 p-2 rounded border border-current/10">
            💡 {suggestion}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 self-start rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
