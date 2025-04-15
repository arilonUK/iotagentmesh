
import { Device } from '@/types/device';

export const getMockDevice = (deviceId: string): Device | null => {
  const mockDevices: Record<string, Device> = {
    '44444444-4444-4444-4444-444444444444': {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Air Quality Monitor',
      type: 'Sensor',
      status: 'warning',
      organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
      last_active_at: new Date().toISOString()
    },
    '11111111-1111-1111-1111-111111111111': {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Temperature Sensor',
      type: 'Sensor',
      status: 'online',
      organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
      last_active_at: new Date().toISOString()
    },
    '22222222-2222-2222-2222-222222222222': {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Smart Light',
      type: 'Actuator',
      status: 'online',
      organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
      last_active_at: new Date().toISOString()
    },
    '33333333-3333-3333-3333-333333333333': {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Motion Detector',
      type: 'Sensor',
      status: 'offline',
      organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
      last_active_at: new Date(Date.now() - 86400000).toISOString()
    }
  };

  return mockDevices[deviceId] || null;
};
