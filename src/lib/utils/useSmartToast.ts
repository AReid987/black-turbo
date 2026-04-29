import { useRef, useCallback } from 'react';
import type { ToastType } from '@/components/ui/Toast';

export interface SmartToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Hook that suppresses duplicate toasts and only notifies on meaningful changes
export function useSmartToast(onToast?: (toast: SmartToastOptions) => void) {
  // Track what we've already toasted about
  const lastToastRef = useRef<Record<string, { timestamp: number; key: string }>>({});
  // Track first-load state per layer
  const firstLoadRef = useRef<Record<string, boolean>>({});

  const smartToast = useCallback((layerKey: string, options: SmartToastOptions, dataKey?: string) => {
    if (!onToast) return;

    const now = Date.now();
    const key = dataKey || options.message || options.title;
    const last = lastToastRef.current[layerKey];

    // Always allow first toast for a layer
    const isFirstLoad = !firstLoadRef.current[layerKey];
    if (isFirstLoad) {
      firstLoadRef.current[layerKey] = true;
      lastToastRef.current[layerKey] = { timestamp: now, key };
      onToast(options);
      return;
    }

    // Suppress identical toast within 5 minutes
    if (last && last.key === key && (now - last.timestamp) < 300000) {
      return;
    }

    lastToastRef.current[layerKey] = { timestamp: now, key };
    onToast(options);
  }, [onToast]);

  const resetLayer = useCallback((layerKey: string) => {
    delete firstLoadRef.current[layerKey];
    delete lastToastRef.current[layerKey];
  }, []);

  return { smartToast, resetLayer };
}
