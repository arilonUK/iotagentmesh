
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeviceReading {
  id: string;
  device_id: string;
  reading_type: string;
  value: number;
  timestamp: string;
}

interface ReadingData {
  name: string; // timestamp formatted
  value: number;
}

interface UseDeviceReadingsOptions {
  timeframe?: 'hour' | 'day' | 'week' | 'month';
  interval?: string; // e.g., '15 minutes', '1 hour'
  aggregation?: 'avg' | 'min' | 'max' | 'sum';
}

export function useDeviceReadings(
  deviceId: string | undefined,
  readingType: string,
  options: UseDeviceReadingsOptions = {}
) {
  // Set defaults
  const {
    timeframe = 'day',
    interval = '1 hour',
    aggregation = 'avg',
  } = options;

  // Calculate dates based on timeframe
  const getTimeframeDates = () => {
    const now = new Date();
    const end = now.toISOString();
    let start;

    switch (timeframe) {
      case 'hour':
        start = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        break;
      case 'day':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        break;
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }

    return { start, end };
  };

  const { start, end } = getTimeframeDates();

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    
    switch (timeframe) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Mock data for now - replace this with actual Supabase query later
  const fetchReadings = async (): Promise<ReadingData[]> => {
    if (!deviceId) {
      return [];
    }
    
    try {
      console.log(`Fetching ${readingType} readings for device ${deviceId}`);
      
      // This is mocked for now - replace with actual Supabase function call
      // In a real implementation, you'd use the Supabase function:
      // const { data, error } = await supabase.rpc('get_device_readings_aggregate', {
      //   p_device_id: deviceId,
      //   p_reading_type: readingType,
      //   p_start_time: start,
      //   p_end_time: end,
      //   p_interval: interval,
      //   p_aggregation_type: aggregation
      // });
      
      // For now, generate some mock data
      const mockData = Array(24).fill(0).map((_, i) => {
        const timestamp = new Date(new Date().setHours(i, 0, 0, 0));
        let baseValue = 0;
        
        if (readingType === 'temperature') {
          baseValue = 22 + Math.sin(i / 24 * Math.PI * 2) * 3;
        } else if (readingType === 'humidity') {
          baseValue = 60 - Math.sin(i / 24 * Math.PI * 2) * 10;
        } else if (readingType === 'energy') {
          baseValue = 200 + Math.random() * 50;
        } else {
          baseValue = 50 + Math.random() * 20;
        }
        
        return {
          name: formatTimestamp(timestamp.toISOString()),
          value: parseFloat(baseValue.toFixed(1))
        };
      });
      
      return mockData;
    } catch (error) {
      console.error('Error fetching device readings:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['deviceReadings', deviceId, readingType, timeframe, interval, aggregation],
    queryFn: fetchReadings,
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
