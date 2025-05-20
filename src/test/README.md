
# Testing Guide

This project uses Vitest for testing React components and hooks.

## Test Structure

Our test suite is organized to mirror the main application structure, with tests categorized by functionality:

1. **Agent Tests** - Validate IoT agent behavior and device interactions
2. **Core Module Tests** - Test shared functionality like logging and configuration
3. **Plugin Tests** - Ensure plugins integrate properly with agents
4. **Utility Tests** - Verify helper functions work correctly

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

## Writing Tests

When writing new tests:
1. Place the test in the appropriate category directory
2. Name tests descriptively with a `.test.ts` or `.test.tsx` extension
3. Use the utilities from `src/test/utils.tsx` for component testing

## Test Utilities

We provide custom test utilities in `src/test/utils.tsx` that include common providers.
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
