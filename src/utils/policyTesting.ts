import { supabase } from '@/integrations/supabase/client';

export interface PolicyTestResult {
  policyName: string;
  operation: string;
  success: boolean;
  expectedResult: boolean;
  error?: string;
}

export class PolicyTester {
  private results: PolicyTestResult[] = [];

  async testPolicy(
    policyName: string,
    operation: string,
    testFn: () => Promise<{ error?: { message?: string } }>,
    expectedToSucceed: boolean = true
  ): Promise<PolicyTestResult> {
    try {
      const result = await testFn();
      const success = expectedToSucceed ? !result.error : !!result.error;

      const testResult: PolicyTestResult = {
        policyName,
        operation,
        success,
        expectedResult: expectedToSucceed,
        error: result.error?.message,
      };

      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const testResult: PolicyTestResult = {
        policyName,
        operation,
        success: false,
        expectedResult: expectedToSucceed,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.results.push(testResult);
      return testResult;
    }
  }

  getResults(): PolicyTestResult[] {
    return this.results;
  }
}

export async function getCurrentUserOrganizations() {
  const { data, error } = await supabase.rpc('get_current_user_organizations');
  return { data, error };
}

export async function testOrganizationMemberAccess(orgId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId);
  return { data, error };
}

export async function runAllPolicyTests() {
  const tester = new PolicyTester();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    console.error('No authenticated user found. Please sign in first.');
    return [];
  }

  const orgsResult = await getCurrentUserOrganizations();
  const orgId = orgsResult.data?.[0]?.organization_id;

  if (!orgId) {
    return [];
  }

  await tester.testPolicy(
    'Users can view org members',
    'SELECT own org members',
    () => testOrganizationMemberAccess(orgId),
    true
  );

  await tester.testPolicy(
    'Security Definer Functions',
    'get_user_org_role function',
    () => supabase.rpc('get_user_org_role', { p_org_id: orgId, p_user_id: currentUser.id }),
    true
  );

  await tester.testPolicy(
    'Security Definer Functions',
    'is_org_member function',
    () => supabase.rpc('is_org_member', { p_org_id: orgId, p_user_id: currentUser.id }),
    true
  );

  await tester.testPolicy(
    'Security Definer Functions',
    'is_org_admin_or_owner function',
    () => supabase.rpc('is_org_admin_or_owner', { p_org_id: orgId, p_user_id: currentUser.id }),
    true
  );

  await tester.testPolicy(
    'Organization Members RPC',
    'get_organization_members function',
    () => supabase.rpc('get_organization_members', { p_org_id: orgId }),
    true
  );

  await tester.testPolicy(
    'Users can view org members',
    'SELECT other org members (should fail)',
    () => testOrganizationMemberAccess('00000000-0000-0000-0000-000000000000'),
    false
  );

  await tester.testPolicy(
    'Admins can add members',
    'INSERT new member',
    () =>
      supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: '00000000-0000-0000-0000-000000000001',
          role: 'member',
        }),
    false
  );

  await tester.testPolicy(
    'Admins can update members',
    'UPDATE member role',
    async () => {
      const { data: members } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', currentUser.id)
        .single();

      return supabase
        .from('organization_members')
        .update({ role: members?.role })
        .eq('id', members?.id);
    },
    true
  );

  return tester.getResults();
}
