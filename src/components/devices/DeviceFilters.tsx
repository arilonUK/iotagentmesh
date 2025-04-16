
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddDeviceDialog } from './AddDeviceDialog';

interface DeviceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  onDeviceAdded?: () => void;
}

const DeviceFilters: React.FC<DeviceFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  onDeviceAdded
}) => {
  return (
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
        
        <AddDeviceDialog onDeviceAdded={onDeviceAdded} />
      </div>
    </div>
  );
}

export default DeviceFilters;
