
import { useParams } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Separator } from "@/components/ui/separator";
import DeviceAlarms from '@/components/alarms/DeviceAlarms';
import DeviceStats from '@/components/DeviceStats';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useEffect } from 'react';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const { device, isLoading, error } = useDevice(id);
  
  // Log for debugging
  useEffect(() => {
    if (error) {
      console.error('Device detail error:', error);
    }
    if (device) {
      console.log('Device loaded:', device);
    }
  }, [device, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
          <p className="text-sm mt-2">
            There was a problem loading the device details. This might be due to a database permission issue.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (!device) {
    return (
      <Alert variant="default" className="my-4">
        <AlertTitle>Device not found</AlertTitle>
        <AlertDescription>
          We couldn't find a device with the ID: {id}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{device.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Type:</strong> {device.type}
            </p>
            <p>
              <strong>ID:</strong> {device.id}
            </p>
            {device.description && (
              <p>
                <strong>Description:</strong> {device.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      {/* Display device statistics */}
      <DeviceStats deviceId={id!} />
      
      <Separator className="my-6" />
      
      <DeviceAlarms deviceId={id!} />
    </div>
  );
}
