
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Database } from 'lucide-react';

export const NextStepsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
        <CardDescription>
          Continue your journey with these related guides
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Device Management</div>
                <div className="text-xs text-muted-foreground">Connect and manage your IoT devices</div>
              </div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Security Best Practices</div>
                <div className="text-xs text-muted-foreground">Secure your IoT infrastructure</div>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
