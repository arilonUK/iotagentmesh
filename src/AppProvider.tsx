
import React from 'react';
import { AppContextProvider } from '@/contexts/AppContextProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
}
