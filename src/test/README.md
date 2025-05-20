
# Testing Guide

This project uses Vitest for testing React components and hooks.

## Running Tests

You can run tests using the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test, in `__tests__` directories.

For example:
- `src/components/MyComponent.tsx` would have a test in `src/components/__tests__/MyComponent.test.tsx`
- `src/hooks/useMyHook.ts` would have a test in `src/hooks/__tests__/useMyHook.test.ts`

## Test Utilities

We provide a custom `render` function in `src/test/utils.tsx` that includes common providers.
Always import from this file rather than directly from `@testing-library/react`.

```typescript
// Good
import { render, screen } from '@/test/utils';

// Not recommended for components that need providers
import { render } from '@testing-library/react';
```

## Mocking

- Use `vi.mock()` to mock dependencies
- Use `vi.fn()` for mocking functions
- Use `vi.spyOn()` to spy on method calls
