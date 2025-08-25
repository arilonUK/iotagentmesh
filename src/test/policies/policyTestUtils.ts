export interface PolicyTestResult {
  policyName: string;
  operation: string;
  success: boolean;
  expectedResult: boolean;
  error?: string;
}