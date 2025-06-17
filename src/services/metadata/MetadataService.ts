
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseFunction {
  id: string;
  name: string;
  description: string;
  created_at: string;
  organization_id: string;
}

export interface PaginatedFunctions {
  data: DatabaseFunction[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TimezoneInfo {
  name: string;
  abbrev: string;
  utc_offset: string;
  is_dst: boolean;
}

class MetadataService {
  async getFunctionsPaginated(
    page: number = 1, 
    pageSize: number = 50,
    schema: string = 'public'
  ): Promise<PaginatedFunctions> {
    console.log(`Fetching functions page ${page} with size ${pageSize} for schema ${schema}`);
    
    try {
      // For now, we'll return mock data since the system catalog queries aren't available
      // This simulates the function metadata that would be retrieved
      const mockFunctions: DatabaseFunction[] = [
        {
          id: '1',
          name: 'get_devices_by_org_id',
          description: 'Retrieves devices for an organization',
          created_at: new Date().toISOString(),
          organization_id: 'mock-org-id'
        },
        {
          id: '2', 
          name: 'create_device_bypass_rls',
          description: 'Creates a new device bypassing RLS',
          created_at: new Date().toISOString(),
          organization_id: 'mock-org-id'
        }
      ];

      const totalCount = mockFunctions.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;
      const paginatedData = mockFunctions.slice(offset, offset + pageSize);

      return {
        data: paginatedData,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error in getFunctionsPaginated:', error);
      return {
        data: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  async getSchemas(): Promise<string[]> {
    try {
      // Return common schemas since we can't query system catalogs
      const schemas = ['public', 'auth', 'storage'];
      return schemas;
    } catch (error) {
      console.error('Error in getSchemas:', error);
      return ['public'];
    }
  }

  /**
   * Get timezone information using the optimized timezone_cache materialized view
   * instead of direct pg_timezone_names queries
   */
  async getTimezones(timezoneName?: string): Promise<TimezoneInfo[]> {
    try {
      console.log('Fetching timezones using optimized function...');
      
      // Use the optimized get_timezone_info function instead of pg_timezone_names
      const { data, error } = await supabase.rpc('get_timezone_info', {
        timezone_name: timezoneName || null
      });

      if (error) {
        console.error('Error fetching timezone info:', error);
        throw error;
      }

      // Convert the data to ensure proper typing, especially for utc_offset
      const typedData: TimezoneInfo[] = (data || []).map((item: any) => ({
        name: String(item.name),
        abbrev: String(item.abbrev),
        utc_offset: String(item.utc_offset), // Convert interval to string
        is_dst: Boolean(item.is_dst)
      }));

      return typedData;
    } catch (error) {
      console.error('Error in getTimezones:', error);
      // Fallback to empty array if the optimized function fails
      return [];
    }
  }

  /**
   * Get all timezone names using the optimized cache
   */
  async getTimezoneNames(): Promise<string[]> {
    try {
      const timezones = await this.getTimezones();
      return timezones.map(tz => tz.name);
    } catch (error) {
      console.error('Error getting timezone names:', error);
      return [];
    }
  }

  /**
   * Refresh the timezone cache - should be called periodically
   */
  async refreshTimezoneCache(): Promise<void> {
    try {
      console.log('Refreshing timezone cache...');
      
      const { error } = await supabase.rpc('refresh_timezone_cache');
      
      if (error) {
        console.error('Error refreshing timezone cache:', error);
        throw error;
      }
      
      console.log('Timezone cache refreshed successfully');
    } catch (error) {
      console.error('Error in refreshTimezoneCache:', error);
      throw error;
    }
  }
}

export const metadataService = new MetadataService();
