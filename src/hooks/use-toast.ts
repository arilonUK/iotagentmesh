
// This hook provides toast functionality throughout the app
import { useContext } from 'react';
import { ToastContext } from '@/contexts/toast';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
}

export const useToast = () => {
  return useContext(ToastContext);
};

export const toast = (props: ToastProps) => {
  const toastContext = useContext(ToastContext);
  if (toastContext) {
    toastContext.toast(props);
  }
};

export default { useToast, toast };
