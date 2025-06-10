
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
}

export const metadataService = new MetadataService();
