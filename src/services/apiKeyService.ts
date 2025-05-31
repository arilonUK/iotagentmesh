import { supabase } from '@/integrations/supabase/client';
import { ApiKey, CreateApiKeyResponse, NewApiKeyFormData, ApiUsage, SubscriptionPlan } from '@/types/apiKey';

export const apiKeyService = {
  async createApiKey(organizationId: string, formData: NewApiKeyFormData): Promise<CreateApiKeyResponse> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the edge function to generate the API key
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: {
          name: formData.name,
          scopes: formData.scopes,
          expiration: formData.expiration
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from API key generation');
      }

      return {
        api_key: data.api_key,
        full_key: data.full_key
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
