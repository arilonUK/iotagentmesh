
import { useParams, useNavigate } from 'react-router-dom';
import { useDevice, DeviceWithAccessPolicyError } from '@/hooks/useDevices';
import { Separator } from "@/components/ui/separator";
import DeviceAlarms from '@/components/alarms/DeviceAlarms';
import DeviceStats from '@/components/DeviceStats';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Device } from '@/types/device';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { device, isLoading, error, refetch } = useDevice(id);
  
  // Helper function to type check if the device has an access policy error
  const hasAccessPolicyError = (device: Device | DeviceWithAccessPolicyError | null): device is DeviceWithAccessPolicyError => {
    return device !== null && 'error' in device && device.error === 'access_policy';
  };
  
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

  // Check for the special access policy error case
  if (hasAccessPolicyError(device)) {
    return (
      <Alert className="my-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          <p>This device exists but cannot be accessed due to database policy restrictions.</p>
          <p className="text-sm mt-2">
            This is likely due to a recursion issue in the database policies. Please contact your administrator.
          </p>
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

  // At this point device is definitely a Device type, not an error object
  const deviceData = device as Device;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{deviceData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Type:</strong> {deviceData.type}
            </p>
            <p>
              <strong>Status:</strong> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              deviceData.status === 'online' ? 'bg-green-100 text-green-800' : 
              deviceData.status === 'offline' ? 'bg-gray-100 text-gray-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {deviceData.status}
            </span>
            </p>
            <p>
              <strong>ID:</strong> {deviceData.id}
            </p>
            {deviceData.description && (
              <p>
                <strong>Description:</strong> {deviceData.description}
              </p>
            )}
            <p>
              <strong>Last active:</strong> {deviceData.last_active_at ? new Date(deviceData.last_active_at).toLocaleString() : 'Never'}
            </p>
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
