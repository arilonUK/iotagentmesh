
import { apiGatewayService, ApiGatewayRequest, ApiGatewayResponse } from '@/services/apiGatewayService';
import { DomainService, QueryParams, ServiceResponse, ServiceLifecycle, ServiceDependencies } from './types';
import { toast } from 'sonner';

export abstract class StandardizedApiService<T, CreateDTO, UpdateDTO> 
  implements DomainService<T, CreateDTO, UpdateDTO>, ServiceLifecycle {
  
  protected abstract readonly endpoint: string;
  protected abstract readonly serviceName: string;
  protected dependencies: ServiceDependencies = {};
  private isInitializedFlag = false;
  
  constructor(dependencies: ServiceDependencies = {}) {
    this.dependencies = dependencies;
  }

  async initialize(): Promise<void> {
    console.log(`Initializing ${this.serviceName} service`);
    this.isInitializedFlag = true;
  }

  async destroy(): Promise<void> {
    console.log(`Destroying ${this.serviceName} service`);
    this.isInitializedFlag = false;
  }

  isInitialized(): boolean {
    return this.isInitializedFlag;
  }

  protected abstract getDataKey(): string;
  protected abstract getSingleDataKey(): string;
  protected abstract getEntityName(): string;

  protected handleError<R>(error: any, operation: string): ServiceResponse<R> {
    const message = error instanceof Error ? error.message : `Failed to ${operation}`;
    console.error(`${this.serviceName}: Error in ${operation}:`, error);
    
    // Only show toast for user-facing operations
    if (!operation.includes('fetch') || operation.includes('create') || operation.includes('update') || operation.includes('delete')) {
      toast.error(message);
    }
    
    return {
      error: message,
      status: error.status || 500
    };
  }

  protected async makeRequest<R>(request: ApiGatewayRequest): Promise<ServiceResponse<R>> {
    try {
      const response: ApiGatewayResponse<R> = await apiGatewayService.request(request);
      
      if (response.error) {
        return {
          error: response.error,
          status: response.status || 500
        };
      }

      return {
        data: response.data,
        status: response.status || 200
      };
    } catch (error) {
      return this.handleError(error, 'make request');
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
      
      if (response.error) {
        console.error(`${this.serviceName}: Failed to fetch items:`, response.error);
        return [];
      }

      const dataKey = this.getDataKey();
      return response.data?.[dataKey] || [];
    } catch (error) {
      this.handleError(error, 'fetch items');
      return [];
    }
  }

  async fetchById(id: string): Promise<T | null> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: `${this.endpoint}/${id}`
      };

      const response = await this.makeRequest<{ [key: string]: T }>(request);
      
      if (response.error) {
        if (response.status === 404) {
          return null;
        }
        console.error(`${this.serviceName}: Failed to fetch item:`, response.error);
        return null;
      }

      const dataKey = this.getSingleDataKey();
      return response.data?.[dataKey] || null;
    } catch (error) {
      this.handleError(error, 'fetch item');
      return null;
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
      
      if (response.error) {
        throw new Error(response.error);
      }

      const dataKey = this.getSingleDataKey();
      const created = response.data?.[dataKey];
      
      if (!created) {
        throw new Error('No data returned from creation');
      }

      toast.success(`${this.getEntityName()} created successfully`);
      return created;
    } catch (error) {
      this.handleError(error, `create ${this.getEntityName()}`);
      throw error;
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
      
      if (response.error) {
        throw new Error(response.error);
      }

      const dataKey = this.getSingleDataKey();
      const updated = response.data?.[dataKey];
      
      if (!updated) {
        throw new Error('No data returned from update');
      }

      toast.success(`${this.getEntityName()} updated successfully`);
      return updated;
    } catch (error) {
      this.handleError(error, `update ${this.getEntityName()}`);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const request: ApiGatewayRequest = {
        method: 'DELETE',
        endpoint: `${this.endpoint}/${id}`
      };

      const response = await this.makeRequest<any>(request);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(`${this.getEntityName()} deleted successfully`);
      return true;
    } catch (error) {
      this.handleError(error, `delete ${this.getEntityName()}`);
      return false;
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
