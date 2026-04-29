import { useState, useCallback, useRef } from 'react';

export type HealthStatus = 'online' | 'degraded' | 'offline' | 'unknown';

export interface SourceHealth {
  source: string;
  status: HealthStatus;
  lastSuccess?: number;
  lastError?: number;
  errorCount: number;
  successCount: number;
}

export function useDataHealth() {
  const [health, setHealth] = useState<Record<string, SourceHealth>>({});
  const healthRef = useRef<Record<string, SourceHealth>>({});

  const updateHealth = useCallback((source: string, success: boolean, error?: string) => {
    const now = Date.now();
    const current = healthRef.current[source] || {
      source,
      status: 'unknown',
      errorCount: 0,
      successCount: 0,
    };

    const updated: SourceHealth = success
      ? {
          ...current,
          status: current.errorCount > 2 ? 'degraded' : 'online',
          lastSuccess: now,
          successCount: current.successCount + 1,
          errorCount: Math.max(0, current.errorCount - 1),
        }
      : {
          ...current,
          status: current.errorCount >= 2 ? 'offline' : 'degraded',
          lastError: now,
          errorCount: current.errorCount + 1,
        };

    healthRef.current[source] = updated;
    setHealth({ ...healthRef.current });
  }, []);

  const getStatus = useCallback((source: string): HealthStatus => {
    return healthRef.current[source]?.status || 'unknown';
  }, []);

  const reset = useCallback(() => {
    healthRef.current = {};
    setHealth({});
  }, []);

  return { health, updateHealth, getStatus, reset };
}
