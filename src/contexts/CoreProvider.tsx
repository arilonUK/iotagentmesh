
import React from 'react';
import { ToastProvider } from '@/contexts/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

interface CoreProviderProps {
  children: React.ReactNode;
}

export const CoreProvider: React.FC<CoreProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ToastProvider>
  );
};
