
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseFunction {
  id: string;
  schema: string;
  name: string;
  language: string;
  definition: string;
  complete_statement: string;
  args: any[];
  argument_types: string;
  return_type: string;
  behavior: string;
  security_definer: boolean;
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
      // Get total count first (with caching for better performance)
      const { count } = await supabase
        .from('pg_proc')
        .select('*', { count: 'exact', head: true })
        .eq('prokind', 'f'); // Only functions, not procedures

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;

      // For now, we'll use a simplified query to avoid the complex system catalog query
      // This is a placeholder that should be replaced with optimized metadata fetching
      const { data: functions, error } = await supabase.rpc('get_database_functions', {
        p_schema: schema,
        p_limit: pageSize,
        p_offset: offset
      });

      if (error) {
        console.error('Error fetching functions:', error);
        // Fallback to empty result rather than failing
        return {
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }

      return {
        data: functions || [],
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
      const { data, error } = await supabase.rpc('get_database_schemas');
      
      if (error) {
        console.error('Error fetching schemas:', error);
        return ['public']; // Fallback to public schema
      }

      return data || ['public'];
    } catch (error) {
      console.error('Error in getSchemas:', error);
      return ['public'];
    }
  }
}

export const metadataService = new MetadataService();
