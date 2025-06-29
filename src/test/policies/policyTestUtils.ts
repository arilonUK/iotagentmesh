
import { supabase } from '@/integrations/supabase/client';

export interface PolicyTestResult {
  policyName: string;
  operation: string;
  success: boolean;
  error?: string;
  expectedResult: boolean;
}

export class PolicyTester {
  private results: PolicyTestResult[] = [];

  async testPolicy(
    policyName: string,
    operation: string,
    testFn: () => Promise<any>,
    expectedToSucceed: boolean = true
  ): Promise<PolicyTestResult> {
    try {
      console.log(`Testing policy: ${policyName} - ${operation}`);
      
      const result = await testFn();
      const success = expectedToSucceed ? !result.error : !!result.error;
      
      const testResult: PolicyTestResult = {
        policyName,
        operation,
        success,
        expectedResult: expectedToSucceed,
        error: result.error?.message
      };
      
      this.results.push(testResult);
      
      if (success) {
        console.log(`✅ ${policyName} - ${operation}: PASSED`);
      } else {
        console.log(`❌ ${policyName} - ${operation}: FAILED`);
        console.log(`   Expected: ${expectedToSucceed ? 'Success' : 'Failure'}`);
        console.log(`   Got: ${result.error ? 'Failure' : 'Success'}`);
        if (result.error) {
          console.log(`   Error: ${result.error.message}`);
        }
      }
      
      return testResult;
    } catch (error) {
      const testResult: PolicyTestResult = {
        policyName,
        operation,
        success: false,
        expectedResult: expectedToSucceed,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.results.push(testResult);
      console.log(`❌ ${policyName} - ${operation}: EXCEPTION`);
      console.log(`   Error: ${testResult.error}`);
      
      return testResult;
    }
  }

  getResults(): PolicyTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total * 100).toFixed(1) : '0'
    };
  }

  printSummary() {
    const summary = this.getSummary();
    console.log('\n=== POLICY TEST SUMMARY ===');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate}%`);
    
    if (summary.failed > 0) {
      console.log('\n=== FAILED TESTS ===');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`❌ ${r.policyName} - ${r.operation}`);
          console.log(`   Error: ${r.error}`);
        });
    }
  }
}

// Helper to create test user sessions
export async function createTestUser(email: string, password: string = 'testpassword123') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: email.split('@')[0],
        full_name: `Test User ${email.split('@')[0]}`
      }
    }
  });
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
  
  return data;
}

// Helper to sign in as different users
export async function signInAsUser(email: string, password: string = 'testpassword123') {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }
  
  return data;
}

// Helper to get current user organizations
export async function getCurrentUserOrganizations() {
  const { data, error } = await supabase.rpc('get_current_user_organizations');
  return { data, error };
}

// Helper to test organization member access
export async function testOrganizationMemberAccess(orgId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId);
  
  return { data, error };
}
