import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />,
    error: <XCircle size={20} className="text-red-500 shrink-0" />,
    warning: <AlertTriangle size={20} className="text-yellow-500 shrink-0" />,
    info: <Info size={20} className="text-[#0ed1e8] shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-[#0ed1e8]',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`bg-white border border-gray-100 border-l-4 ${borders[t.type]} rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300`}
          >
            {icons[t.type]}
            <p className="flex-1 text-sm font-semibold text-[#03292e]">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
