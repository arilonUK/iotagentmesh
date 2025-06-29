
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Lock } from 'lucide-react';
import PolicyTestRunner from '@/components/testing/PolicyTestRunner';

const PolicyTestingSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-3xl font-bold mb-2">Security Policy Testing</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing tools to verify Row Level Security policies are working correctly 
          without recursion issues. Essential for maintaining secure data access patterns.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              RLS Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tests all Row Level Security policies to ensure proper access control 
              and prevent unauthorized data access.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Validates that security definer functions work correctly without 
              causing infinite recursion in policy checks.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verifies role-based access control and ensures users can only 
              access data they're authorized to see.
            </p>
          </CardContent>
        </Card>
      </div>

      <PolicyTestRunner />

      <Card>
        <CardHeader>
          <CardTitle>Policy Testing Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What Gets Tested</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>SELECT Policies:</strong> Users can only view organization members they have access to</li>
              <li>• <strong>INSERT Policies:</strong> Only admins/owners can add new members</li>
              <li>• <strong>UPDATE Policies:</strong> Role updates respect hierarchy (owners > admins > members)</li>
              <li>• <strong>DELETE Policies:</strong> Only authorized users can remove members</li>
              <li>• <strong>Security Functions:</strong> All SECURITY DEFINER functions work without recursion</li>
              <li>• <strong>Cross-Organization Access:</strong> Users cannot access other organizations' data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Common Issues Detected</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Infinite recursion in RLS policies</li>
              <li>• Missing or incorrect role checks</li>
              <li>• Policies that are too permissive or restrictive</li>
              <li>• Security definer functions with wrong permissions</li>
              <li>• Performance issues with complex policy queries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyTestingSection;
