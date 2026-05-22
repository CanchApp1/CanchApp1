import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface ConfirmState {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

interface ConfirmContextValue {
  confirm: (message: string, confirmLabel?: string, cancelLabel?: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({ confirm: async () => false });

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
  });

  const resolveRef = useRef<((val: boolean) => void) | null>(null);

  const confirm = useCallback(
    (message: string, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar'): Promise<boolean> => {
      setState({ open: true, message, confirmLabel, cancelLabel });
      return new Promise<boolean>(resolve => {
        resolveRef.current = resolve;
      });
    },
    []
  );

  const handleConfirm = () => {
    setState(s => ({ ...s, open: false }));
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setState(s => ({ ...s, open: false }));
    resolveRef.current?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200">
            <p className="text-[#03292e] font-bold text-base text-center mb-6 leading-relaxed">
              {state.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-[#03292e] hover:bg-[#0a4149] transition-all active:scale-95"
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
