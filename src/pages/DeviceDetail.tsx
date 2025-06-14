
import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Separator } from "@/components/ui/separator";
import DeviceAlarms from '@/components/alarms/DeviceAlarms';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, RefreshCw, ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeviceDashboard } from '@/components/dashboard/DeviceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceRealTimeMonitor } from '@/components/devices/DeviceRealTimeMonitor';
import { DeviceActivityTimeline } from '@/components/devices/DeviceActivityTimeline';
import { useDeviceReadings } from '@/hooks/useDeviceReadings';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { device, isLoading, error, refetch } = useDevice(id);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get temperature data for the charts
  const { data: temperatureData, isLoading: isLoadingTemperature, refetch: refetchTemperature } = 
    useDeviceReadings(id, 'temperature', { timeframe: 'day' });
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log('=== DEVICE DETAIL DEBUG ===');
    console.log('Device ID from URL:', id);
    console.log('Device ID valid UUID format:', id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false);
    console.log('Device loading state:', isLoading);
    console.log('Device error:', error);
    console.log('Device data:', device);
    console.log('Current route params:', { id });
    
    if (error) {
      console.error('Device detail error details:', error);
    }
    if (device) {
      console.log('Device loaded successfully:', {
        id: device.id,
        name: device.name,
        organization_id: device.organization_id
      });
    } else if (!isLoading && id) {
      console.log('No device found for ID:', id);
      console.log('This might be a non-existent device ID');
    }
  }, [device, error, id, isLoading]);

  const handleRefreshData = () => {
    refetchTemperature();
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToDevices = () => {
    navigate('/devices');
  };

  // Validate device ID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Handle invalid UUID format
  if (id && !isValidUUID(id)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Device ID</AlertTitle>
          <AlertDescription>
            <p>The device ID format is invalid: {id}</p>
            <p className="text-sm mt-2 text-muted-foreground">
              Device IDs must be valid UUIDs. Please check the URL and try again.
            </p>
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={handleGoToDevices}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Devices
              </Button>
              <Button 
                variant="default" 
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading device details...</p>
          <p className="text-xs text-gray-500 mt-2">Device ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Device</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Device ID: {id}
          </p>
          <p className="text-sm mt-1 text-muted-foreground">
            There was a problem loading the device details. This device may not exist or you may not have access to it.
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
              onClick={handleGoToDevices}
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
      <div className="space-y-6">
        <Alert variant="default" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Device Not Found</AlertTitle>
          <AlertDescription>
            <p>We couldn't find a device with the ID: <code className="bg-gray-100 px-1 rounded">{id}</code></p>
            <p className="text-sm mt-2 text-muted-foreground">
              This device may not exist, may have been deleted, or you may not have access to it. You can go back to the devices list or dashboard to see available devices.
            </p>
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={handleGoToDevices}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Devices List
              </Button>
              <Button 
                variant="default" 
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{device.name}</h1>
        <Button 
          variant="outline" 
          onClick={handleGoToDevices}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Devices
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Real-Time Monitoring</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="alarms">Alarms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Device Dashboard */}
          <DeviceDashboard 
            device={device}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-4 mt-4">
          <DeviceRealTimeMonitor 
            device={device}
            onRefresh={handleRefreshData}
          />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4 mt-4">
          <DeviceActivityTimeline 
            deviceId={id!}
            onRefresh={() => refetch()}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="alarms" className="space-y-4 mt-4">
          {/* Device Alarms */}
          <DeviceAlarms deviceId={id!} />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
    </div>
  );
};
