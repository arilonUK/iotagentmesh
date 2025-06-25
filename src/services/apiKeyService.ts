
import { ApiKey, CreateApiKeyResponse, NewApiKeyFormData, ApiUsage, SubscriptionPlan } from '@/types/apiKey';
import { apiKeyApiService } from '@/services/apiKeyApiService';
import { supabase } from '@/integrations/supabase/client';

export const apiKeyService = {
  async createApiKey(organizationId: string, formData: NewApiKeyFormData): Promise<CreateApiKeyResponse> {
    try {
      console.log('Creating API key through API Gateway for organization:', organizationId);
      return await apiKeyApiService.createApiKey(formData);
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  },

  async getApiKeys(organizationId: string): Promise<ApiKey[]> {
    try {
      console.log('Fetching API keys through API Gateway for organization:', organizationId);
      return await apiKeyApiService.getApiKeys();
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  },

  async updateApiKey(id: string, updates: Partial<Pick<ApiKey, 'name' | 'is_active' | 'scopes'>>): Promise<ApiKey> {
    try {
      console.log('Updating API key through API Gateway:', id);
      return await apiKeyApiService.updateApiKey(id, updates);
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  },

  async refreshApiKey(id: string): Promise<string> {
    try {
      console.log('Refreshing API key through API Gateway:', id);
      return await apiKeyApiService.refreshApiKey(id);
    } catch (error) {
      console.error('Error refreshing API key:', error);
      throw error;
    }
  },

  async deleteApiKey(id: string): Promise<void> {
    try {
      console.log('Deleting API key through API Gateway:', id);
      const success = await apiKeyApiService.deleteApiKey(id);
      if (!success) {
        throw new Error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  },

  async getApiUsage(organizationId: string, limit = 100): Promise<ApiUsage[]> {
    try {
      console.log('Fetching API usage through API Gateway for organization:', organizationId);
      return await apiKeyApiService.getApiUsage(limit);
    } catch (error) {
      console.error('Error fetching API usage:', error);
      throw error;
    }
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      // Keep this as direct Supabase call since it's reference data
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }
};
