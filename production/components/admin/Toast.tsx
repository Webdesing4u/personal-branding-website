'use client';

// Toast system — max 3 visible, overflow queued FIFO.
// When a visible toast expires, the next queued one is promoted.

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastApi {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const MAX_VISIBLE = 3;
const TTL = 4000;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const KIND_STYLES: Record<ToastKind, string> = {
  success: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200',
  error: 'border-red-500/50 bg-red-500/15 text-red-200',
  info: 'border-sky-500/50 bg-sky-500/15 text-sky-200',
};
const KIND_ICON: Record<ToastKind, string> = { success: '✅', error: '⚠️', info: 'ℹ️' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState<ToastItem[]>([]);
  const queue = useRef<ToastItem[]>([]);
  const idRef = useRef(0);

  const scheduleExpiry = useCallback((id: number) => {
    setTimeout(() => {
      setVisible((v) => {
        const next = v.filter((x) => x.id !== id);
        // Promote next queued toast, if any
        const promoted = queue.current.shift();
        if (promoted) {
          scheduleExpiryRef.current(promoted.id);
          return [...next, promoted];
        }
        return next;
      });
    }, TTL);
  }, []);
  const scheduleExpiryRef = useRef(scheduleExpiry);
  scheduleExpiryRef.current = scheduleExpiry;

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const item: ToastItem = { id: ++idRef.current, kind, text };
      setVisible((v) => {
        if (v.length < MAX_VISIBLE) {
          scheduleExpiryRef.current(item.id);
          return [...v, item];
        }
        queue.current.push(item); // over capacity → queue
        return v;
      });
    },
    []
  );

  const api: ToastApi = {
    success: (text) => push('success', text),
    error: (text) => push('error', text),
    info: (text) => push('info', text),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-80 flex-col gap-2">
        {visible.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto animate-[slideIn_.2s_ease-out] rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${KIND_STYLES[t.kind]}`}
          >
            <span className="mr-2">{KIND_ICON[t.kind]}</span>
            {t.text}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
