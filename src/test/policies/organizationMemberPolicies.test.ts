import { runAllPolicyTests } from '@/utils/policyTesting';
import { describe, it } from 'vitest';

describe('organization member policies', () => {
  it('runs all policy tests', async () => {
    await runAllPolicyTests();
  });
});
