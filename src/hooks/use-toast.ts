
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
  const context = useContext(ToastContext);
  
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default useToast;
