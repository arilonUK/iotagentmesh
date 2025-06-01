
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppProvider from '@/AppProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="iot-ui-theme">
      <AppProvider>
        <Outlet />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
