
import { PolicyTester, signInAsUser, testOrganizationMemberAccess, getCurrentUserOrganizations } from './policyTestUtils';
import { supabase } from '@/integrations/supabase/client';

export async function testOrganizationMemberPolicies() {
  const tester = new PolicyTester();
  
  console.log('Starting Organization Member Policy Tests...\n');
  
  // Get current user for testing
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (!currentUser) {
    console.error('No authenticated user found. Please sign in first.');
    return;
  }
  
  console.log(`Testing as user: ${currentUser.email}`);
  
  // Test 1: User can view their own organization members
  await tester.testPolicy(
    'Users can view org members',
    'SELECT own org members',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found for user') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      return await testOrganizationMemberAccess(orgId);
    },
    true
  );
  
  // Test 2: Test the security definer functions
  await tester.testPolicy(
    'Security Definer Functions',
    'get_user_org_role function',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      const { data, error } = await supabase.rpc('get_user_org_role', {
        p_org_id: orgId,
        p_user_id: currentUser.id
      });
      
      return { data, error };
    },
    true
  );
  
  // Test 3: is_org_member function
  await tester.testPolicy(
    'Security Definer Functions',
    'is_org_member function',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      const { data, error } = await supabase.rpc('is_org_member', {
        p_org_id: orgId,
        p_user_id: currentUser.id
      });
      
      return { data, error };
    },
    true
  );
  
  // Test 4: is_org_admin_or_owner function
  await tester.testPolicy(
    'Security Definer Functions',
    'is_org_admin_or_owner function',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      const { data, error } = await supabase.rpc('is_org_admin_or_owner', {
        p_org_id: orgId,
        p_user_id: currentUser.id
      });
      
      return { data, error };
    },
    true
  );
  
  // Test 5: Test organization members RPC function
  await tester.testPolicy(
    'Organization Members RPC',
    'get_organization_members function',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      const { data, error } = await supabase.rpc('get_organization_members', {
        p_org_id: orgId
      });
      
      return { data, error };
    },
    true
  );
  
  // Test 6: Test that user cannot access other organization's members
  await tester.testPolicy(
    'Users can view org members',
    'SELECT other org members (should fail)',
    async () => {
      // Use a random UUID that doesn't exist or belong to the user
      const fakeOrgId = '00000000-0000-0000-0000-000000000000';
      return await testOrganizationMemberAccess(fakeOrgId);
    },
    false // This should fail (return empty results, not error due to RLS)
  );
  
  // Test 7: Test INSERT policy (admin/owner can add members)
  await tester.testPolicy(
    'Admins can add members',
    'INSERT new member',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      
      // Try to insert a test member (this will likely fail due to non-existent user)
      const { data, error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: '00000000-0000-0000-0000-000000000001', // Fake user ID
          role: 'member'
        });
      
      return { data, error };
    },
    false // This should fail because the user_id doesn't exist
  );
  
  // Test 8: Test UPDATE policy (admin/owner can update roles)
  await tester.testPolicy(
    'Admins can update members',
    'UPDATE member role',
    async () => {
      const orgsResult = await getCurrentUserOrganizations();
      if (orgsResult.error || !orgsResult.data?.length) {
        return { error: new Error('No organizations found') };
      }
      
      const orgId = orgsResult.data[0].organization_id;
      
      // Get current user's member record
      const { data: members, error: fetchError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', currentUser.id)
        .single();
      
      if (fetchError || !members) {
        return { error: fetchError || new Error('No member record found') };
      }
      
      // Try to update the role (should work if user is admin/owner)
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role: members.role }) // Update to same role (no-op)
        .eq('id', members.id);
      
      return { data, error };
    },
    true
  );
  
  tester.printSummary();
  return tester.getResults();
}

// Helper function to run all policy tests
export async function runAllPolicyTests() {
  console.log('🔍 Running Policy Effectiveness Tests\n');
  
  const results = await testOrganizationMemberPolicies();
  
  console.log('\n✅ Policy tests completed!');
  
  return results;
}
