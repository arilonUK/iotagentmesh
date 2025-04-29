
import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Separator } from "@/components/ui/separator";
import DeviceAlarms from '@/components/alarms/DeviceAlarms';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DeviceDashboard } from '@/components/dashboard/DeviceDashboard';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { device, isLoading, error, refetch } = useDevice(id);
  
  // Log for debugging
  useEffect(() => {
    console.log('DeviceDetail component - Device ID from URL:', id);
    
    if (error) {
      console.error('Device detail error:', error);
    }
    if (device) {
      console.log('Device loaded:', device);
    } else if (!isLoading) {
      console.log('No device found for ID:', id);
    }
  }, [device, error, id, isLoading]);

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
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
          <p className="text-sm mt-2">
            There was a problem loading the device details.
          </p>
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard/devices')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Devices
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!device) {
    return (
      <Alert variant="default" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Device not found</AlertTitle>
        <AlertDescription>
          <p>We couldn't find a device with the ID: {id}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/dashboard/devices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices List
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{device.name}</h1>
      
      {/* Device Dashboard */}
      <DeviceDashboard 
        device={device}
        isLoading={isLoading}
        error={error}
      />
      
      <Separator className="my-6" />
      
      {/* Device Alarms */}
      <DeviceAlarms deviceId={id!} />
    </div>
  );
};
