import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  leaving?: boolean;
}

interface ToastContextType {
  notify: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  notify: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, JSX.Element> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const ACCENT: Record<ToastType, string> = {
  success: 'from-emerald-500 to-tertiary-500 text-emerald-50',
  error: 'from-rose-500 to-red-600 text-rose-50',
  info: 'from-primary-500 to-accent-500 text-primary-50',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }, []);

  const notify = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const api: ToastContextType = {
    notify,
    success: (t, m) => notify('success', t, m),
    error: (t, m) => notify('error', t, m),
    info: (t, m) => notify('info', t, m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-3 w-[min(92vw,22rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto rounded-xl shadow-2xl border border-white/10 backdrop-blur-md overflow-hidden"
            style={{
              animation: `${toast.leaving ? 'toastOut' : 'toastIn'} 0.3s cubic-bezier(0.22,1,0.36,1) both`,
            }}
          >
            <div className={`flex items-start gap-3 p-4 bg-gradient-to-r ${ACCENT[toast.type]}`}>
              <span className="mt-0.5 flex-shrink-0">{ICONS[toast.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs mt-0.5 opacity-90 break-words">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div
              className="h-1 bg-white/40 origin-left"
              style={{ animation: 'shrinkBar 4.2s linear forwards' }}
            />
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes shrinkBar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
