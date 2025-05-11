import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevices } from '@/hooks/useDevices';
import { useOrganization } from '@/contexts/organization';
import { useToast } from '@/hooks/use-toast';
import DeviceFilters from '@/components/devices/DeviceFilters';
import DeviceDebugInfo from '@/components/devices/DeviceDebugInfo';
import DeviceGrid from '@/components/devices/DeviceGrid';

const Devices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { organization } = useOrganization();
  const { devices, isLoading, error, refetch } = useDevices(organization?.id);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Devices page - Organization context:', organization);
    if (organization?.id) {
      console.log(`Devices page using organization ID: ${organization.id}`);
    } else {
      console.warn('No organization ID available in Devices page');
    }
  }, [organization]);

  useEffect(() => {
    console.log('Devices data updated:', { 
      count: devices.length, 
      isLoading, 
      hasError: !!error 
    });
    
    if (devices.length > 0) {
      console.log('First device sample:', devices[0]);
    } else {
      console.log('No devices available to display');
    }
  }, [devices, isLoading, error]);

  const filteredDevices = React.useMemo(() => {
    console.log('Running device filtering logic...');
    
    const filtered = devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
      const matchesType = filterType === 'all' || device.type.toLowerCase() === filterType.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    console.log(`Filtering results: ${filtered.length} devices matched out of ${devices.length} total`);
    return filtered;
  }, [devices, searchTerm, filterStatus, filterType]);

  const handleRetry = () => {
    toast({ title: "Retrying", description: "Attempting to fetch devices again." });
    refetch();
  };

  const handleDeviceAdded = () => {
    console.log('Device added, refreshing list...');
    refetch();
  };

  if (isLoading && devices.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Devices</h1>
          <p className="text-muted-foreground">Loading your connected devices...</p>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Rendering error state:', error);
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Devices</h1>
          <p className="text-muted-foreground">There was a problem fetching your devices.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading devices: {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  if (!organization?.id) {
    console.warn('Rendering no-organization state');
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Devices</h1>
          <p className="text-muted-foreground">No organization selected.</p>
        </div>
        <Alert>
          <AlertDescription>
            Please select an organization to view devices.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Devices</h1>
        <p className="text-muted-foreground">View and manage all your connected devices.</p>
      </div>

      <DeviceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        onDeviceAdded={handleDeviceAdded}
      />

      <DeviceDebugInfo
        organizationId={organization.id}
        totalDevices={devices.length}
        filteredDevices={filteredDevices.length}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterType={filterType}
      />

      <DeviceGrid
        devices={devices}
        filteredDevices={filteredDevices}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default Devices;
