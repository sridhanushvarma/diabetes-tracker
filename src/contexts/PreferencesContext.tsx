import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TargetRange, DEFAULT_TARGET_RANGE } from '@/utils/glucoseAnalytics';

interface PreferencesContextType {
  targetRange: TargetRange;
  setTargetRange: (range: TargetRange) => void;
  resetTargetRange: () => void;
  ready: boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  targetRange: DEFAULT_TARGET_RANGE,
  setTargetRange: () => {},
  resetTargetRange: () => {},
  ready: false,
});

export const usePreferences = () => useContext(PreferencesContext);

const STORAGE_KEY = 'dt_target_range';

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [targetRange, setRange] = useState<TargetRange>(DEFAULT_TARGET_RANGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed.low === 'number' &&
          typeof parsed.high === 'number' &&
          parsed.low < parsed.high
        ) {
          setRange({ low: parsed.low, high: parsed.high });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  const setTargetRange = useCallback((range: TargetRange) => {
    const safe: TargetRange = {
      low: Math.max(40, Math.min(range.low, range.high - 1)),
      high: Math.min(400, Math.max(range.high, range.low + 1)),
    };
    setRange(safe);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const resetTargetRange = useCallback(() => {
    setRange(DEFAULT_TARGET_RANGE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{ targetRange, setTargetRange, resetTargetRange, ready }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};
