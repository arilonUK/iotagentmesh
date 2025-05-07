
import React, { createContext, useState, useContext, useCallback } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ToastProps } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ToastContextValue {
  toast: (props: ToastProps) => void;
  toasts: ToastProps[];
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  toasts: [],
  dismissToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (props: ToastProps) => {
      const id = props.id || uuidv4();
      setToasts((prevToasts) => [...prevToasts, { ...props, id }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissToast(id);
      }, 5000);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismissToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export const toast = (props: ToastProps) => {
  const { toast } = useToast();
  toast(props);
};
