'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export type ToastType = 'info' | 'warning' | 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const iconColor = {
    info: 'text-blue-400',
    warning: 'text-amber-400',
    success: 'text-green-400',
    error: 'text-red-400',
  }[toast.type];

  const borderColor = {
    info: 'border-blue-500/30',
    warning: 'border-amber-500/30',
    success: 'border-green-500/30',
    error: 'border-red-500/30',
  }[toast.type];

  const Icon = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertTriangle,
  }[toast.type];

  return (
    <div className={`relative bg-black/95 border ${borderColor} rounded-lg shadow-xl overflow-hidden min-w-[280px] max-w-[360px]`}>
      <div className="flex items-start space-x-3 px-3 py-2.5">
        <Icon className={`w-4 h-4 mt-0.5 ${iconColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-green-400 text-[11px] font-mono font-bold truncate">{toast.title}</p>
          {toast.message && (
            <p className="text-gray-400 text-[10px] font-mono mt-0.5 line-clamp-2">{toast.message}</p>
          )}
        </div>
        <button onClick={onDismiss} className="text-gray-600 hover:text-gray-400 flex-shrink-0">
          <X className="w-3 h-3" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-gray-800">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-amber-500' :
            toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-14 right-4 z-50 flex flex-col space-y-2 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismissToast };
}
