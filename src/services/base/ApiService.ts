
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export abstract class ApiService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected abstract readonly endpoint: string;
  protected abstract readonly entityName: string;
  protected abstract readonly dataKey: string;
  protected abstract readonly singleDataKey: string;

  protected async makeRequest<R = any>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    data?: any;
    headers?: Record<string, string>;
    pathSuffix?: string;
  }): Promise<R> {
    try {
      console.log(`=== API SERVICE REQUEST START ===`);
      console.log(`Method: ${options.method}`);
      console.log(`Endpoint: ${options.endpoint}`);
      console.log(`Path suffix: ${options.pathSuffix || 'none'}`);
      console.log(`Data:`, options.data);
      
      // Extract the function name from the endpoint (remove 'api-' prefix for function invoke)
      const functionName = options.endpoint.replace(/^api-/, '');
      console.log(`Function name: ${functionName}`);
      
      // Prepare the request payload for the edge function
      const requestPayload = {
        method: options.method,
        path: options.pathSuffix || '',
        data: options.data || null
      };
      
      console.log(`Request payload:`, JSON.stringify(requestPayload, null, 2));
      
      // Use Supabase functions.invoke with proper error handling
      const response = await supabase.functions.invoke(functionName, {
        body: requestPayload,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      console.log(`Supabase function response:`, response);

      if (response.error) {
        console.error(`Supabase function error:`, response.error);
        throw new Error(`Function error: ${response.error.message || response.error}`);
      }

      if (!response.data) {
        console.error('No data returned from function');
        throw new Error('No data returned from function');
      }

      console.log(`=== API SERVICE REQUEST SUCCESS ===`);
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

  protected handleError(error: any, operation: string): never {
    const message = error instanceof Error ? error.message : `Failed to ${operation}`;
    console.error(`${this.entityName} service error in ${operation}:`, error);
    toast.error(message);
    throw new Error(message);
  }

  async fetchAll(params?: QueryParams): Promise<T[]> {
    try {
      console.log(`Fetching all ${this.entityName} items`);
      
      const response = await this.makeRequest<any>({
        method: 'GET',
        endpoint: this.endpoint
      });

      // Handle both wrapped and direct array responses
      let items: T[];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && typeof response === 'object' && response[this.dataKey]) {
        items = response[this.dataKey];
      } else {
        items = [];
      }

      console.log(`Found ${items.length} ${this.entityName} items:`, items);
      return items;
    } catch (error) {
      console.error(`Error fetching ${this.entityName} items:`, error);
      this.handleError(error, 'fetch items');
    }
  }

  async fetchById(id: string): Promise<T | null> {
    try {
      console.log(`Fetching ${this.entityName} with ID: ${id}`);
      
      const response = await this.makeRequest<any>({
        method: 'GET',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`
      });

      // Handle both wrapped and direct object responses
      let item: T | null;
      if (response && typeof response === 'object') {
        if (response[this.singleDataKey]) {
          item = response[this.singleDataKey];
        } else {
          // Assume the response is the item itself
          item = response;
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
      
      const response = await this.makeRequest<any>({
        method: 'POST',
        endpoint: this.endpoint,
        data
      });

      // Handle both wrapped and direct object responses
      let created: T;
      if (response && typeof response === 'object') {
        if (response[this.singleDataKey]) {
          created = response[this.singleDataKey];
        } else {
          // Assume the response is the created item itself
          created = response;
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
      
      const response = await this.makeRequest<any>({
        method: 'PUT',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`,
        data
      });

      // Handle both wrapped and direct object responses
      let updated: T;
      if (response && typeof response === 'object') {
        if (response[this.singleDataKey]) {
          updated = response[this.singleDataKey];
        } else {
          // Assume the response is the updated item itself
          updated = response;
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
