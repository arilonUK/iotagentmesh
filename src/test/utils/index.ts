import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function that includes providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, options);

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };