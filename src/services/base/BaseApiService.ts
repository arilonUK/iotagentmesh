
import { apiGatewayService, ApiGatewayRequest, ApiGatewayResponse } from '@/services/apiGatewayService';
import { DomainService, QueryParams, ServiceResponse } from './types';
import { toast } from 'sonner';

export abstract class BaseApiService<T, CreateDTO, UpdateDTO> implements DomainService<T, CreateDTO, UpdateDTO> {
  protected abstract readonly endpoint: string;

  protected handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    const message = error instanceof Error ? error.message : `Failed to ${operation}`;
    toast.error(message);
    throw new Error(message);
  }

  protected async makeRequest<R>(request: ApiGatewayRequest): Promise<R> {
    try {
      const response: ApiGatewayResponse<R> = await apiGatewayService.request(request);
      
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data as R;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Request failed');
    }
  }

  async fetchAll(params?: QueryParams): Promise<T[]> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint
      };

      const response = await this.makeRequest<{ [key: string]: T[] }>(request);
      const dataKey = this.getDataKey();
      return response[dataKey] || [];
    } catch (error) {
      this.handleError(error, 'fetch items');
    }
  }

  async fetchById(id: string): Promise<T | null> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: `${this.endpoint}/${id}`
      };

      const response = await this.makeRequest<{ [key: string]: T }>(request);
      const dataKey = this.getSingleDataKey();
      return response[dataKey] || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      this.handleError(error, 'fetch item');
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      const request: ApiGatewayRequest = {
        method: 'POST',
        endpoint: this.endpoint,
        data,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await this.makeRequest<{ [key: string]: T }>(request);
      const dataKey = this.getSingleDataKey();
      const created = response[dataKey];
      
      if (!created) {
        throw new Error('No data returned from creation');
      }

      toast.success(`${this.getEntityName()} created successfully`);
      return created;
    } catch (error) {
      this.handleError(error, `create ${this.getEntityName()}`);
    }
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      const request: ApiGatewayRequest = {
        method: 'PUT',
        endpoint: `${this.endpoint}/${id}`,
        data,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await this.makeRequest<{ [key: string]: T }>(request);
      const dataKey = this.getSingleDataKey();
      const updated = response[dataKey];
      
      if (!updated) {
        throw new Error('No data returned from update');
      }

      toast.success(`${this.getEntityName()} updated successfully`);
      return updated;
    } catch (error) {
      this.handleError(error, `update ${this.getEntityName()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const request: ApiGatewayRequest = {
        method: 'DELETE',
        endpoint: `${this.endpoint}/${id}`
      };

      await this.makeRequest<any>(request);
      toast.success(`${this.getEntityName()} deleted successfully`);
      return true;
    } catch (error) {
      this.handleError(error, `delete ${this.getEntityName()}`);
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

  protected abstract getDataKey(): string;
  protected abstract getSingleDataKey(): string;
  protected abstract getEntityName(): string;
}
