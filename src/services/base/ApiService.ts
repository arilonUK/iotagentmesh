
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

  protected getBaseUrl(): string {
    return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  }

  protected async makeRequest<R = any>(options: {
    method: string;
    endpoint: string;
    data?: any;
    headers?: Record<string, string>;
  }): Promise<R> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = `${this.getBaseUrl()}${options.endpoint}`;
      
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage: string;
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.error || parsedError.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorData || `HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`API request failed for ${options.endpoint}:`, error);
      throw error;
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
      const queryString = params ? this.buildQueryString(params) : '';
      const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      const response = await this.makeRequest<{ [key: string]: T[] }>({
        method: 'GET',
        endpoint
      });

      return response[this.dataKey] || [];
    } catch (error) {
      this.handleError(error, 'fetch items');
    }
  }

  async fetchById(id: string): Promise<T | null> {
    try {
      const response = await this.makeRequest<{ [key: string]: T }>({
        method: 'GET',
        endpoint: `${this.endpoint}/${id}`
      });

      return response[this.singleDataKey] || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      this.handleError(error, 'fetch item');
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      const response = await this.makeRequest<{ [key: string]: T }>({
        method: 'POST',
        endpoint: this.endpoint,
        data
      });

      const created = response[this.singleDataKey];
      if (!created) {
        throw new Error('No data returned from creation');
      }

      toast.success(`${this.entityName} created successfully`);
      return created;
    } catch (error) {
      this.handleError(error, `create ${this.entityName}`);
    }
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      const response = await this.makeRequest<{ [key: string]: T }>({
        method: 'PUT',
        endpoint: `${this.endpoint}/${id}`,
        data
      });

      const updated = response[this.singleDataKey];
      if (!updated) {
        throw new Error('No data returned from update');
      }

      toast.success(`${this.entityName} updated successfully`);
      return updated;
    } catch (error) {
      this.handleError(error, `update ${this.entityName}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.makeRequest({
        method: 'DELETE',
        endpoint: `${this.endpoint}/${id}`
      });

      toast.success(`${this.entityName} deleted successfully`);
      return true;
    } catch (error) {
      this.handleError(error, `delete ${this.entityName}`);
    }
  }

  protected buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return searchParams.toString();
  }
}
