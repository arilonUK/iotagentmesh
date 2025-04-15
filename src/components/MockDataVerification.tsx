
import React from 'react';
import { useVerifyMockData } from '@/hooks/useDevices';
import { useOrganization } from '@/contexts/organization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const MockDataVerification = () => {
  const { organization } = useOrganization();
  const { data, isLoading, error } = useVerifyMockData(organization?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifying Mock Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to verify mock data</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Mock Data Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Devices ({data?.devices.length ?? 0})</h3>
            <div className="max-h-60 overflow-y-auto rounded border p-4">
              <pre className="text-sm">
                {JSON.stringify(data?.devices, null, 2)}
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Device Readings ({data?.readings.length ?? 0})</h3>
            <div className="max-h-60 overflow-y-auto rounded border p-4">
              <pre className="text-sm">
                {JSON.stringify(data?.readings, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MockDataVerification;
