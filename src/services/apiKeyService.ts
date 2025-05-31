
import { supabase } from '@/integrations/supabase/client';
import { ApiKey, CreateApiKeyResponse, NewApiKeyFormData, ApiUsage, SubscriptionPlan } from '@/types/apiKey';
import { v4 as uuidv4 } from 'uuid';

export const apiKeyService = {
  async createApiKey(organizationId: string, formData: NewApiKeyFormData): Promise<CreateApiKeyResponse> {
    try {
      // Generate a secure API key
      const keyId = uuidv4().replace(/-/g, '');
      const fullKey = `iot_${keyId}`;
      const prefix = `iot_${keyId.substring(0, 8)}...`;
      
      // Hash the key for storage (in a real implementation, use proper hashing)
      const keyHash = btoa(fullKey); // Simple base64 encoding for demo
      
      // Calculate expiration date
      let expiresAt = null;
      if (formData.expiration !== 'never') {
        const months = parseInt(formData.expiration);
        expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          organization_id: organizationId,
          name: formData.name,
          key_hash: keyHash,
          prefix,
          scopes: formData.scopes,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        api_key: data,
        full_key: fullKey
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  },

  async getApiKeys(organizationId: string): Promise<ApiKey[]> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  },

  async updateApiKey(id: string, updates: Partial<Pick<ApiKey, 'name' | 'is_active' | 'scopes'>>): Promise<ApiKey> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  },

  async deleteApiKey(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  },

  async getApiUsage(organizationId: string, limit = 100): Promise<ApiUsage[]> {
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching API usage:', error);
      throw error;
    }
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
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
