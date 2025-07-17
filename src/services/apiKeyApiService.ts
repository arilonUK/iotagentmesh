import { apiGatewayService, ApiGatewayRequest, ApiGatewayResponse } from '@/services/apiGatewayService';
import { ApiKey, CreateApiKeyResponse, NewApiKeyFormData, ApiUsage } from '@/types/apiKey';

export interface ApiKeyApiResponse {
  api_keys?: ApiKey[];
  api_key?: ApiKey;
  full_key?: string;
  usage?: ApiUsage[];
  success?: boolean;
  message?: string;
}

export class ApiKeyApiService {
  /**
   * Get all API keys for the current organization
   */
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: '/api/keys'
      };

      const response: ApiGatewayResponse<ApiKeyApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to fetch API keys:', response.error);
        throw new Error(response.error);
      }

      return response.data?.api_keys || [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch API keys');
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(formData: NewApiKeyFormData): Promise<CreateApiKeyResponse> {
    try {
      const request: ApiGatewayRequest = {
        method: 'POST',
        endpoint: '/api/keys',
        data: {
          name: formData.name,
          scopes: formData.scopes,
          expiration: formData.expiration
        },
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<ApiKeyApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to create API key:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.api_key || !response.data?.full_key) {
        throw new Error('No API key data returned from creation');
      }

      return {
        api_key: response.data.api_key,
        full_key: response.data.full_key
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error instanceof Error ? error : new Error('Failed to create API key');
    }
  }

  /**
   * Refresh an existing API key (generate new key, invalidate old one)
   */
  async refreshApiKey(id: string): Promise<string> {
    try {
      const request: ApiGatewayRequest = {
        method: 'POST',
        endpoint: `/api/keys/${id}/refresh`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<ApiKeyApiResponse> = await apiGatewayService.request(request);
      
      console.log('Refresh API response:', response);
      
      if (response.error) {
        console.error('Failed to refresh API key:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.full_key) {
        console.error('No full_key in response:', response.data);
        throw new Error('No new API key returned from refresh');
      }

      console.log('Returning full_key:', response.data.full_key);
      return response.data.full_key;
    } catch (error) {
      console.error('Error refreshing API key:', error);
      throw error instanceof Error ? error : new Error('Failed to refresh API key');
    }
  }

  /**
   * Update an existing API key
   */
  async updateApiKey(id: string, updates: Partial<Pick<ApiKey, 'name' | 'is_active' | 'scopes'>>): Promise<ApiKey> {
    try {
      const request: ApiGatewayRequest = {
        method: 'PUT',
        endpoint: `/api/keys/${id}`,
        data: updates,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<ApiKeyApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to update API key:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.api_key) {
        throw new Error('No API key data returned from update');
      }

      return response.data.api_key;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error instanceof Error ? error : new Error('Failed to update API key');
    }
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(id: string): Promise<boolean> {
    try {
      const request: ApiGatewayRequest = {
        method: 'DELETE',
        endpoint: `/api/keys/${id}`
      };

      const response: ApiGatewayResponse<ApiKeyApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to delete API key:', response.error);
        throw new Error(response.error);
      }

      return response.data?.success || response.status === 200;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error instanceof Error ? error : new Error('Failed to delete API key');
    }
  }

  /**
   * Get API usage statistics
   */
  async getApiUsage(limit = 100): Promise<ApiUsage[]> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: `/api/keys/usage?limit=${limit}`
      };

      const response: ApiGatewayResponse<ApiKeyApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to fetch API usage:', response.error);
        throw new Error(response.error);
      }

      return response.data?.usage || [];
    } catch (error) {
      console.error('Error fetching API usage:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch API usage');
    }
  }
}

export const apiKeyApiService = new ApiKeyApiService();
