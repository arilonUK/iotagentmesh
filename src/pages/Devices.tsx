
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter } from 'lucide-react';
import DeviceCard from '@/components/DeviceCard';
import MockDataVerification from '@/components/MockDataVerification';

// Updated mock devices with UUIDs that match the ones in the database
const mockDevices = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Temperature Sensor',
    type: 'Sensor',
    status: 'online' as const,
    lastActive: '2 minutes ago'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Smart Light',
    type: 'Actuator',
    status: 'online' as const,
    lastActive: '5 minutes ago'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Motion Detector',
    type: 'Sensor',
    status: 'offline' as const,
    lastActive: '3 hours ago'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Air Quality Monitor',
    type: 'Sensor',
    status: 'warning' as const,
    lastActive: 'Just now'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Smart Plug',
    type: 'Actuator',
    status: 'online' as const,
    lastActive: '10 minutes ago'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Security Camera',
    type: 'Sensor',
    status: 'online' as const,
    lastActive: '1 hour ago'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Humidity Sensor',
    type: 'Sensor',
    status: 'offline' as const,
    lastActive: '1 day ago'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'Smart Thermostat',
    type: 'Actuator',
    status: 'online' as const,
    lastActive: '15 minutes ago'
  }
];

const Devices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showVerification, setShowVerification] = useState(false);

  const filteredDevices = mockDevices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesType = filterType === 'all' || device.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Devices</h1>
          <p className="text-muted-foreground">View and manage all your connected devices.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowVerification(!showVerification)}
        >
          {showVerification ? 'Hide' : 'Show'} Verification
        </Button>
      </div>

      {showVerification && (
        <MockDataVerification />
      )}

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

      {/* Devices Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} {...device} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No devices found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Devices;
