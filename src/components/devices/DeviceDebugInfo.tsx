
import React from 'react';

interface DeviceDebugInfoProps {
  organizationId: string;
  totalDevices: number;
  filteredDevices: number;
  searchTerm: string;
  filterStatus: string;
  filterType: string;
}

const DeviceDebugInfo: React.FC<DeviceDebugInfoProps> = ({
  organizationId,
  totalDevices,
  filteredDevices,
  searchTerm,
  filterStatus,
  filterType
}) => {
  return (
    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
      <p>Organization ID: {organizationId}</p>
      <p>Total devices: {totalDevices}</p>
      <p>Filtered devices: {filteredDevices}</p>
      <p>Search term: "{searchTerm}"</p>
      <p>Status filter: {filterStatus}</p>
      <p>Type filter: {filterType}</p>
    </div>
  );
};

export default DeviceDebugInfo;
