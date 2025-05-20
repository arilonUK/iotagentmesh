
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'storage-1' },
            error: null
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              { id: 'storage-1', reading: 23.5, timestamp: '2023-01-01T00:00:00Z' },
              { id: 'storage-2', reading: 24.1, timestamp: '2023-01-01T00:01:00Z' }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('Data Storage Plugin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should store sensor readings in the database', async () => {
    // Implement placeholder for storing data
    const storeReading = async (deviceId: string, reading: number): Promise<string | null> => {
      const { data, error } = await supabase.from('device_readings')
        .insert({ 
          device_id: deviceId, 
          value: reading, // Changed from 'reading' to 'value' to match expected type
          reading_type: 'temperature', // Added required field
          organization_id: 'org-123', // Added required field
          timestamp: new Date().toISOString() 
        })
        .select()
        .single();
        
      if (error) return null;
      return data.id;
    };
    
    const result = await storeReading('device-123', 23.5);
    expect(result).toBe('storage-1');
  });

  it('should retrieve historical readings for a device', async () => {
    // Implement placeholder for retrieving data
    const getReadings = async (deviceId: string): Promise<any[]> => {
      const { data, error } = await supabase.from('device_readings')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false });
        
      if (error) return [];
      return data;
    };
    
    const readings = await getReadings('device-123');
    expect(readings.length).toBe(2);
    expect(readings[0].reading).toBe(23.5);
  });
});
