import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FilterValue {
  [key: string]: unknown;
}

export interface QueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, FilterValue>;
}

interface RequestBody {
  method?: string;
  path?: string;
  data?: unknown;
}

export abstract class ApiService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected abstract readonly endpoint: string;
  protected abstract readonly entityName: string;
  protected abstract readonly dataKey: string;
  protected abstract readonly singleDataKey: string;

  protected async makeRequest<R = unknown>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    data?: unknown;
    headers?: Record<string, string>;
    pathSuffix?: string;
  }): Promise<R> {
    try {
      console.log(`=== API SERVICE REQUEST START ===`);
      console.log(`Method: ${options.method}`);
      console.log(`Endpoint: ${options.endpoint}`);
      console.log(`Path suffix: ${options.pathSuffix || 'none'}`);
      console.log(`Data:`, options.data);
      
      const functionName = options.endpoint;
      console.log(`Function name: ${functionName}`);
      
      // For Supabase functions.invoke, we need to send the data directly in the body
      let requestBody: RequestBody | null = null;
      
      if (options.method === 'GET' && !options.pathSuffix) {
        // For simple GET requests (like fetching all devices), don't send any body
        requestBody = null;
      } else if (options.method === 'GET' || options.method === 'DELETE') {
        // For GET/DELETE with path, only send path info if needed
        if (options.pathSuffix) {
          requestBody = {
            method: options.method,
            path: options.pathSuffix
          };
        }
      } else {
        // For POST/PUT, send the data along with method and path info
        requestBody = {
          method: options.method,
          path: options.pathSuffix || '',
          data: options.data || {}
        };
      }
      
      console.log(`Request body:`, requestBody);
      
      // Use Supabase functions.invoke with proper error handling
      const response = await supabase.functions.invoke(functionName, {
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      console.log(`Supabase function response:`, response);
      console.log(`Response data:`, response.data);
      console.log(`Response error:`, response.error);

      if (response.error) {
        console.error(`Supabase function error:`, response.error);
        throw new Error(`Function error: ${response.error.message || response.error}`);
      }

      if (response.data === null || response.data === undefined) {
        console.error('No data returned from function');
        throw new Error('No data returned from function');
      }

      console.log(`=== API SERVICE REQUEST SUCCESS ===`);
      console.log(`Final response data:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`=== API SERVICE REQUEST FAILED ===`);
      console.error(`Error details:`, error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Function not found')) {
          throw new Error(`Edge function '${options.endpoint}' not found or not deployed`);
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error: Please check your connection');
        }
        throw error;
      }
      
      throw new Error(`Unknown error occurred: ${error}`);
    }
  }

  protected handleError(error: unknown, operation: string): never {
    const message = error instanceof Error ? error.message : `Failed to ${operation}`;
    console.error(`${this.entityName} service error in ${operation}:`, error);
    toast.error(message);
    throw new Error(message);
  }

  async fetchAll(params?: QueryParams): Promise<T[]> {
    try {
      console.log(`=== FETCHALL START - ${this.entityName} ===`);
      console.log(`Fetching all ${this.entityName} items`);
      
      const response = await this.makeRequest<unknown>({
        method: 'GET',
        endpoint: this.endpoint
      });

      console.log(`=== FETCHALL RESPONSE - ${this.entityName} ===`);
      console.log(`Raw response:`, response);
      console.log(`Response type:`, typeof response);

      // Handle both wrapped and direct array responses
      let items: T[];
      if (Array.isArray(response)) {
        console.log(`Response is direct array with ${response.length} items`);
        items = response as T[];
      } else if (response && typeof response === 'object' && (response as Record<string, unknown>)[this.dataKey]) {
        console.log(`Response is wrapped object, extracting ${this.dataKey}`);
        console.log(`${this.dataKey} value:`, (response as Record<string, unknown>)[this.dataKey]);
        console.log(`${this.dataKey} is array:`, Array.isArray((response as Record<string, unknown>)[this.dataKey]));
        items = (response as Record<string, unknown>)[this.dataKey] as T[];
      } else {
        console.log(`Response format not recognized, defaulting to empty array`);
        console.log(`Looking for dataKey: ${this.dataKey}`);
        console.log(`Available keys:`, response ? Object.keys(response) : 'no keys');
        items = [];
      }

      console.log(`=== FETCHALL FINAL - ${this.entityName} ===`);
      console.log(`Final items:`, items);
      console.log(`Final items type:`, typeof items);
      console.log(`Final items is array:`, Array.isArray(items));
      console.log(`Final items length:`, items?.length);
      
      return items || [];
    } catch (error) {
      console.error(`=== FETCHALL ERROR - ${this.entityName} ===`);
      console.error(`Error fetching ${this.entityName} items:`, error);
      // Don't throw error, return empty array to prevent UI crashes
      console.log(`Returning empty array due to error`);
      return [];
    }
  }

  async fetchById(id: string): Promise<T | null> {
    try {
      console.log(`Fetching ${this.entityName} with ID: ${id}`);
      
      const response = await this.makeRequest<unknown>({
        method: 'GET',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`
      });

      // Handle both wrapped and direct object responses
      let item: T | null;
      if (response && typeof response === 'object') {
        if ((response as Record<string, unknown>)[this.singleDataKey]) {
          item = (response as Record<string, unknown>)[this.singleDataKey] as T;
        } else {
          // Assume the response is the item itself
          item = response as T;
        }
      } else {
        item = null;
      }

      console.log(`Found ${this.entityName}:`, item);
      return item;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log(`${this.entityName} not found with ID: ${id}`);
        return null;
      }
      console.error(`Error fetching ${this.entityName}:`, error);
      this.handleError(error, 'fetch item');
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      console.log(`Creating ${this.entityName}:`, data);
      
      const response = await this.makeRequest<unknown>({
        method: 'POST',
        endpoint: this.endpoint,
        data
      });

      // Handle both wrapped and direct object responses
      let created: T;
      if (response && typeof response === 'object') {
        if ((response as Record<string, unknown>)[this.singleDataKey]) {
          created = (response as Record<string, unknown>)[this.singleDataKey] as T;
        } else {
          // Assume the response is the created item itself
          created = response as T;
        }
      } else {
        throw new Error('No data returned from creation');
      }

      console.log(`${this.entityName} created successfully:`, created);
      toast.success(`${this.entityName} created successfully`);
      return created;
    } catch (error) {
      console.error(`Error creating ${this.entityName}:`, error);
      this.handleError(error, `create ${this.entityName}`);
    }
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      console.log(`Updating ${this.entityName} ${id}:`, data);
      
      const response = await this.makeRequest<unknown>({
        method: 'PUT',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`,
        data
      });

      // Handle both wrapped and direct object responses
      let updated: T;
      if (response && typeof response === 'object') {
        if ((response as Record<string, unknown>)[this.singleDataKey]) {
          updated = (response as Record<string, unknown>)[this.singleDataKey] as T;
        } else {
          // Assume the response is the updated item itself
          updated = response as T;
        }
      } else {
        throw new Error('No data returned from update');
      }

      console.log(`${this.entityName} updated successfully:`, updated);
      toast.success(`${this.entityName} updated successfully`);
      return updated;
    } catch (error) {
      console.error(`Error updating ${this.entityName}:`, error);
      this.handleError(error, `update ${this.entityName}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Deleting ${this.entityName} ${id}`);
      
      await this.makeRequest({
        method: 'DELETE',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`
      });

      console.log(`${this.entityName} deleted successfully`);
      toast.success(`${this.entityName} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.entityName}:`, error);
      this.handleError(error, `delete ${this.entityName}`);
    }
  }
}
