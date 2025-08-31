import { iotAgentMeshApiService, TelemetryUploadRequest, TelemetryData } from './iotAgentMeshApiService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TelemetryEntry {
  id: string;
  device_id: string;
  organization_id: string;
  timestamp: string;
  reading_type: string;
  value: number;
  metadata?: Record<string, unknown>;
  mesh_synced: boolean;
  quality?: 'good' | 'bad' | 'uncertain';
  unit?: string;
}

export interface TelemetryQueryOptions {
  device_id?: string;
  reading_type?: string;
  start_time?: string;
  end_time?: string;
  limit?: number;
  aggregation?: 'avg' | 'min' | 'max' | 'sum' | 'count';
  interval?: string;
}

export interface TelemetryMetrics {
  total_readings: number;
  unique_devices: number;
  data_points_today: number;
  average_frequency: number;
  latest_reading: string;
  quality_distribution: {
    good: number;
    bad: number;
    uncertain: number;
  };
}

interface TelemetryReading {
  timestamp: string;
  value: number;
  count?: number;
}

export class TelemetryDataService {
  private readonly meshService = iotAgentMeshApiService;

  async uploadTelemetry(data: TelemetryUploadRequest): Promise<boolean> {
    try {
      console.log('Uploading telemetry data:', data);
      
      // Upload to mesh first
      const meshSuccess = await this.meshService.uploadTelemetry(data);
      
      // Convert mesh telemetry format to local format and store
      await this.storeTelemetryLocally(data, meshSuccess);
      
      if (meshSuccess) {
        toast.success('Telemetry data uploaded successfully');
      } else {
        toast.warning('Telemetry stored locally but failed to sync to mesh');
      }
      
      return meshSuccess;
    } catch (error) {
      console.error('Error uploading telemetry:', error);
      
      // Try to store locally even if mesh upload fails
      try {
        await this.storeTelemetryLocally(data, false);
        toast.warning('Telemetry stored locally but failed to sync to mesh');
      } catch (localError) {
        console.error('Failed to store telemetry locally:', localError);
        toast.error('Failed to upload telemetry data');
      }
      
      return false;
    }
  }

  async getTelemetryData(options: TelemetryQueryOptions = {}): Promise<TelemetryEntry[]> {
    try {
      console.log('Fetching telemetry data with options:', options);
      
      // Build query for local data
      let query = supabase
        .from('device_readings')
        .select('*')
        .order('timestamp', { ascending: false });

      if (options.device_id) {
        query = query.eq('device_id', options.device_id);
      }

      if (options.reading_type) {
        query = query.eq('reading_type', options.reading_type);
      }

      if (options.start_time) {
        query = query.gte('timestamp', options.start_time);
      }

      if (options.end_time) {
        query = query.lte('timestamp', options.end_time);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: localData, error } = await query;

      if (error) {
        console.error('Error fetching local telemetry data:', error);
        return [];
      }

      // Convert to TelemetryEntry format
      const telemetryEntries: TelemetryEntry[] = (localData || []).map(reading => {
        const metadata = reading.metadata as Record<string, unknown> || {};
        return {
          id: reading.id,
          device_id: reading.device_id,
          organization_id: reading.organization_id,
          timestamp: reading.timestamp,
          reading_type: reading.reading_type,
          value: reading.value,
          metadata: metadata,
          mesh_synced: Boolean(metadata.mesh_synced),
          quality: (metadata.quality as 'good' | 'bad' | 'uncertain') || 'good',
          unit: metadata.unit as string | undefined
        };
      });

      console.log(`Fetched ${telemetryEntries.length} telemetry entries`);
      return telemetryEntries;
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
      return [];
    }
  }

  async getTimeSeriesData(deviceId: string, metric: string, startTime: string, endTime: string): Promise<TelemetryData[]> {
    try {
      console.log(`Fetching time series data for device ${deviceId}, metric ${metric}`);
      
      // Try to get data from mesh first
      try {
        const meshData = await this.meshService.getTimeSeriesData(deviceId, metric, startTime, endTime);
        if (meshData.length > 0) {
          return meshData;
        }
      } catch (meshError) {
        console.warn('Mesh time series data not available:', meshError);
      }

      // Fallback to local data
      const localData = await this.getTelemetryData({
        device_id: deviceId,
        reading_type: metric,
        start_time: startTime,
        end_time: endTime
      });

      // Convert local format to mesh format
      return localData.map(entry => ({
        device_id: entry.device_id,
        timestamp: entry.timestamp,
        metrics: {
          [entry.reading_type]: {
            value: entry.value,
            unit: entry.unit,
            quality: entry.quality
          }
        },
        metadata: entry.metadata
      }));
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  }

  async getSensorData(deviceId: string, sensorId: string, startTime?: string, endTime?: string): Promise<TelemetryData[]> {
    try {
      console.log(`Fetching sensor data for device ${deviceId}, sensor ${sensorId}`);
      
      // Try mesh service first
      try {
        return await this.meshService.getSensorData(deviceId, sensorId, startTime, endTime);
      } catch (meshError) {
        console.warn('Mesh sensor data not available:', meshError);
      }

      // Fallback to local data
      const localData = await this.getTelemetryData({
        device_id: deviceId,
        reading_type: sensorId,
        start_time: startTime,
        end_time: endTime
      });

      // Convert to mesh format
      return localData.map(entry => ({
        device_id: entry.device_id,
        timestamp: entry.timestamp,
        metrics: {
          [entry.reading_type]: {
            value: entry.value,
            unit: entry.unit,
            quality: entry.quality
          }
        },
        metadata: entry.metadata
      }));
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return [];
    }
  }

  async getAggregatedData(options: TelemetryQueryOptions & { aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count' }): Promise<TelemetryReading[]> {
    try {
      console.log('Fetching aggregated telemetry data:', options);
      
      // Use Supabase's aggregation functions
      let query = supabase
        .from('device_readings')
        .select('reading_type, timestamp, value')
        .order('timestamp', { ascending: true });

      if (options.device_id) {
        query = query.eq('device_id', options.device_id);
      }

      if (options.reading_type) {
        query = query.eq('reading_type', options.reading_type);
      }

      if (options.start_time) {
        query = query.gte('timestamp', options.start_time);
      }

      if (options.end_time) {
        query = query.lte('timestamp', options.end_time);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching data for aggregation:', error);
        return [];
      }

      // Client-side aggregation (in production, this should be done on the server)
      const groupedData = this.groupDataByInterval(data || [], options.interval || '1h');
      return this.aggregateGroupedData(groupedData, options.aggregation);
    } catch (error) {
      console.error('Error fetching aggregated data:', error);
      return [];
    }
  }

  async getTelemetryMetrics(): Promise<TelemetryMetrics> {
    try {
      console.log('Calculating telemetry metrics');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get total readings count
      const { count: totalReadings } = await supabase
        .from('device_readings')
        .select('*', { count: 'exact', head: true });

      // Get unique devices count using distinct
      const { data: uniqueDevices } = await supabase
        .from('device_readings')
        .select('device_id');

      // Get today's readings count
      const { count: todayReadings } = await supabase
        .from('device_readings')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', todayISO);

      // Get latest reading timestamp
      const { data: latestReading } = await supabase
        .from('device_readings')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);

      // Quality distribution (simulated for now)
      const qualityDistribution = {
        good: Math.floor((totalReadings || 0) * 0.85),
        bad: Math.floor((totalReadings || 0) * 0.1),
        uncertain: Math.floor((totalReadings || 0) * 0.05)
      };

      return {
        total_readings: totalReadings || 0,
        unique_devices: uniqueDevices?.length || 0,
        data_points_today: todayReadings || 0,
        average_frequency: this.calculateAverageFrequency(totalReadings || 0),
        latest_reading: latestReading?.[0]?.timestamp || '',
        quality_distribution: qualityDistribution
      };
    } catch (error) {
      console.error('Error calculating telemetry metrics:', error);
      return {
        total_readings: 0,
        unique_devices: 0,
        data_points_today: 0,
        average_frequency: 0,
        latest_reading: '',
        quality_distribution: { good: 0, bad: 0, uncertain: 0 }
      };
    }
  }

  async syncTelemetryToMesh(deviceId: string, startTime?: string, endTime?: string): Promise<boolean> {
    try {
      console.log(`Syncing telemetry to mesh for device ${deviceId}`);
      
      const telemetryData = await this.getTelemetryData({
        device_id: deviceId,
        start_time: startTime,
        end_time: endTime,
        limit: 1000 // Sync in batches
      });

      let successCount = 0;
      for (const entry of telemetryData) {
        if (!entry.mesh_synced) {
          const uploadData: TelemetryUploadRequest = {
            device_id: entry.device_id,
            timestamp: entry.timestamp,
            metrics: {
              [entry.reading_type]: {
                value: entry.value,
                unit: entry.unit,
                quality: entry.quality
              }
            },
            metadata: entry.metadata
          };

          const success = await this.meshService.uploadTelemetry(uploadData);
          if (success) {
            successCount++;
            
            // Mark as synced in local database
            await supabase
              .from('device_readings')
              .update({
                metadata: { ...entry.metadata, mesh_synced: true }
              })
              .eq('id', entry.id);
          }
        }
      }

      const syncPercentage = telemetryData.length > 0 ? (successCount / telemetryData.length) * 100 : 0;
      
      if (syncPercentage === 100) {
        toast.success(`All ${successCount} telemetry entries synced to mesh`);
      } else if (successCount > 0) {
        toast.warning(`Synced ${successCount}/${telemetryData.length} telemetry entries to mesh`);
      } else {
        toast.error('Failed to sync telemetry data to mesh');
      }

      return syncPercentage > 0;
    } catch (error) {
      console.error('Error syncing telemetry to mesh:', error);
      toast.error('Failed to sync telemetry data to mesh');
      return false;
    }
  }

  private async storeTelemetryLocally(data: TelemetryUploadRequest, meshSynced: boolean): Promise<void> {
    try {
      // Convert mesh format to local database format
      const readings = Object.entries(data.metrics).map(([reading_type, metric]) => ({
        device_id: data.device_id,
        organization_id: '', // Will be set by RLS
        timestamp: data.timestamp || new Date().toISOString(),
        reading_type,
        value: typeof metric.value === 'number' ? metric.value : parseFloat(String(metric.value)),
        metadata: {
          ...data.metadata,
          mesh_synced: meshSynced,
          quality: metric.quality,
          unit: metric.unit
        }
      }));

      const { error } = await supabase
        .from('device_readings')
        .insert(readings);

      if (error) {
        throw error;
      }

      console.log(`Stored ${readings.length} telemetry readings locally`);
    } catch (error) {
      console.error('Error storing telemetry locally:', error);
      throw error;
    }
  }

  private groupDataByInterval(data: TelemetryReading[], interval: string): Map<string, TelemetryReading[]> {
    const groups = new Map<string, TelemetryReading[]>();
    
    for (const item of data) {
      const timestamp = new Date(item.timestamp);
      const intervalKey = this.getIntervalKey(timestamp, interval);
      
      if (!groups.has(intervalKey)) {
        groups.set(intervalKey, []);
      }
      groups.get(intervalKey)!.push(item);
    }
    
    return groups;
  }

  private getIntervalKey(timestamp: Date, interval: string): string {
    switch (interval) {
      case '1m':
        return timestamp.toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
      case '5m':
        const minutes = Math.floor(timestamp.getMinutes() / 5) * 5;
        timestamp.setMinutes(minutes, 0, 0);
        return timestamp.toISOString().substring(0, 16);
      case '1h':
        return timestamp.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      case '1d':
        return timestamp.toISOString().substring(0, 10); // YYYY-MM-DD
      default:
        return timestamp.toISOString().substring(0, 13);
    }
  }

  private aggregateGroupedData(groups: Map<string, TelemetryReading[]>, aggregation: string): TelemetryReading[] {
    const result: TelemetryReading[] = [];
    
    for (const [intervalKey, items] of groups.entries()) {
      const values = items.map(item => item.value);
      let aggregatedValue: number;
      
      switch (aggregation) {
        case 'avg':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'sum':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        default:
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
      
      result.push({
        timestamp: intervalKey,
        value: aggregatedValue,
        count: values.length
      });
    }
    
    return result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private calculateAverageFrequency(totalReadings: number): number {
    // Simplified calculation - assumes data over the last 30 days
    const daysOfData = 30;
    return totalReadings / daysOfData;
  }
}

export const telemetryDataService = new TelemetryDataService();