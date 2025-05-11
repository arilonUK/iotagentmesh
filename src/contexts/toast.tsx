
import React, { createContext, useState, useCallback } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { v4 as uuidv4 } from 'uuid';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
}

interface ToastContextValue {
  toast: (props: ToastProps) => void;
  toasts: ToastProps[];
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

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

// Remove the standalone toast function that was causing the hook rules violation
