
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
import { DeviceGroupList } from '@/components/devices/groups/DeviceGroupList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceGroupSelector } from '@/components/devices/groups/DeviceGroupSelector';
import { useDeviceGroups } from '@/hooks/useDeviceGroups';
import { Device } from '@/types/device';

const Devices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [activeTab, setActiveTab] = useState('devices');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const { organization } = useOrganization();
  const { devices, isLoading, error, refetch } = useDevices(organization?.id);
  const { 
    deviceGroups, 
    isLoading: isLoadingGroups, 
    batchAddToGroup,
    batchRemoveFromGroup
  } = useDeviceGroups(organization?.id);
  const { toast } = useToast();

  // Reset selections when changing tabs
  useEffect(() => {
    setSelectedDevices([]);
  }, [activeTab]);

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
      
      // Group filtering will be applied in the component after we have the initial filtered list
      
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

  const handleSelectDevice = (deviceId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedDevices(prev => [...prev, deviceId]);
    } else {
      setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  const handleSelectAllDevices = (devices: Device[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedDevices(devices.map(device => device.id));
    } else {
      setSelectedDevices([]);
    }
  };

  const handleAddToGroup = (groupId: string) => {
    if (selectedDevices.length === 0) {
      toast({
        title: "No devices selected",
        description: "Please select at least one device to add to a group.",
        variant: "destructive"
      });
      return;
    }

    batchAddToGroup({ deviceIds: selectedDevices, groupId });
  };

  const handleRemoveFromGroup = (groupId: string) => {
    if (selectedDevices.length === 0) {
      toast({
        title: "No devices selected",
        description: "Please select at least one device to remove from the group.",
        variant: "destructive"
      });
      return;
    }

    batchRemoveFromGroup({ deviceIds: selectedDevices, groupId });
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
            Error loading devices: {error}
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="groups">Device Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="devices" className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <DeviceFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
              onDeviceAdded={handleDeviceAdded}
            />
            
            <div className="flex-1 max-w-xs">
              <DeviceGroupSelector 
                onSelect={setFilterGroup}
                selectedGroupId={filterGroup}
                placeholder="Filter by group"
              />
            </div>
          </div>

          {selectedDevices.length > 0 && (
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedDevices.length} device(s) selected
              </span>
              <div className="flex items-center gap-2">
                {filterGroup !== 'all' ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRemoveFromGroup(filterGroup)}
                  >
                    Remove from Group
                  </Button>
                ) : (
                  <DeviceGroupSelector
                    onSelect={handleAddToGroup}
                    placeholder="Add to group..."
                    className="w-44"
                  />
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedDevices([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          <DeviceDebugInfo
            organizationId={organization.id}
            totalDevices={devices.length}
            filteredDevices={filteredDevices.length}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterType={filterType}
            filterGroup={filterGroup}
          />

          <DeviceGrid
            devices={devices}
            filteredDevices={filteredDevices}
            onRetry={handleRetry}
            enableSelection={true}
            selectedDevices={selectedDevices}
            onSelectDevice={handleSelectDevice}
            onSelectAll={handleSelectAllDevices}
            filterGroup={filterGroup}
          />
        </TabsContent>
        
        <TabsContent value="groups" className="mt-6">
          <DeviceGroupList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Devices;
