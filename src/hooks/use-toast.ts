
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

// Don't export a standalone toast function that uses hooks directly
// Instead export the hook itself which should be used within components

export default useToast;
