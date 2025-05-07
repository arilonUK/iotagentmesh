
// This hook is used to provide toast functionality throughout the app
import { createContext, useContext } from 'react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
}

const ToastContext = createContext<{
  toast: (props: ToastProps) => void;
  toasts: ToastProps[];
}>({
  toast: () => {},
  toasts: [],
});

export const useToast = () => {
  return useContext(ToastContext);
};

export const toast = (props: ToastProps) => {
  const { toast } = useToast();
  toast(props);
};

// Re-export default toast for backward compatibility
export default { useToast, toast };
