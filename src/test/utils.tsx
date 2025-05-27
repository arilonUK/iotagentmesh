

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/contexts/toast';

// A custom render function that includes providers our components need
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Explicitly export screen and waitFor from @testing-library/dom
export { screen, waitFor };

