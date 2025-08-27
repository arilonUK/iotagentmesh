
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Play, Loader2, Shield, Database } from 'lucide-react';
import { runAllPolicyTests, type PolicyTestResult } from '@/utils/policyTesting';

const PolicyTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PolicyTestResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    passRate: string;
  } | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);
    
    try {
      console.log('Starting policy tests...');
      const testResults = await runAllPolicyTests();
      
      setResults(testResults);
      
      const total = testResults.length;
      const passed = testResults.filter(r => r.success).length;
      const failed = total - passed;
      
      setSummary({
        total,
        passed,
        failed,
        passRate: total > 0 ? (passed / total * 100).toFixed(1) : '0'
      });
      
    } catch (error) {
      console.error('Error running policy tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean, expectedResult: boolean) => {
    if (success) {
      return <Badge variant="default" className="bg-green-500">PASSED</Badge>;
    } else {
      return <Badge variant="destructive">FAILED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Row Level Security Policy Tester
          </CardTitle>
          <CardDescription>
            Test the effectiveness of RLS policies to ensure they work correctly without recursion.
            This will verify that organization member policies are functioning as expected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run Policy Tests'}
            </Button>
            
            {summary && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>Total: {summary.total}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Passed: {summary.passed}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>Failed: {summary.failed}</span>
                </div>
                <Badge variant={summary.failed > 0 ? "destructive" : "default"}>
                  {summary.passRate}% Pass Rate
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed results of all policy tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.success)}
                      <div>
                        <div className="font-medium">
                          {result.policyName} - {result.operation}
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.success, result.expectedResult)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>What this tests:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Organization member SELECT policies (users can only see their org members)</li>
            <li>• Security definer functions work without recursion</li>
            <li>• INSERT/UPDATE/DELETE policies respect role hierarchies</li>
            <li>• RPC functions return expected data</li>
            <li>• Cross-organization access is properly blocked</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PolicyTestRunner;
