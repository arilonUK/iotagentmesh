
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DeviceCard from '@/components/DeviceCard';
import { useDevices } from '@/hooks/useDevices';
import { useOrganization } from '@/contexts/organization';
import { toast } from '@/components/ui/use-toast';

const Devices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { organization } = useOrganization();
  const { devices, isLoading, error, refetch } = useDevices(organization?.id);
  
  // Enhanced organization context logging
  useEffect(() => {
    console.log('Devices page - Organization context:', organization);
    if (organization?.id) {
      console.log(`Devices page using organization ID: ${organization.id}`);
    } else {
      console.warn('No organization ID available in Devices page');
    }
  }, [organization]);

  // Log when devices are loaded or updated
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

  // Log filter changes
  useEffect(() => {
    console.log('Filter criteria changed:', {
      searchTerm,
      filterStatus,
      filterType
    });
  }, [searchTerm, filterStatus, filterType]);

  // Filter devices based on user criteria with logging
  const filteredDevices = React.useMemo(() => {
    console.log('Running device filtering logic...');
    
    const filtered = devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
      const matchesType = filterType === 'all' || device.type.toLowerCase() === filterType.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    console.log(`Filtering results: ${filtered.length} devices matched out of ${devices.length} total`);
    
    if (devices.length > 0 && filtered.length === 0) {
      console.log('All devices filtered out. Filter criteria:', {
        searchTerm,
        filterStatus,
        filterType
      });
    }
    
    return filtered;
  }, [devices, searchTerm, filterStatus, filterType]);

  // Handle retry on error
  const handleRetry = () => {
    toast({ title: "Retrying", description: "Attempting to fetch devices again." });
    refetch();
  };

  // Show loading state
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

  // Show error state
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

  // No organization selected
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search devices..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sensor">Sensor</SelectItem>
              <SelectItem value="actuator">Actuator</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Debug info */}
      {true && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p>Organization ID: {organization?.id}</p>
          <p>Total devices: {devices.length}</p>
          <p>Filtered devices: {filteredDevices.length}</p>
          <p>Search term: "{searchTerm}"</p>
          <p>Status filter: {filterStatus}</p>
          <p>Type filter: {filterType}</p>
        </div>
      )}

      {/* Devices Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard 
              key={device.id}
              id={device.id}
              name={device.name}
              type={device.type}
              status={device.status}
              last_active_at={device.last_active_at}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-2">
            {devices.length > 0 
              ? "No devices match your filter criteria" 
              : "No devices found for this organization"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {devices.length > 0
              ? "Try adjusting your search or filters above"
              : "You can add devices using the 'Add Device' button above"}
          </p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={handleRetry}
          >
            Refresh Devices
          </Button>
        </div>
      )}
    </div>
  );
};

export default Devices;
