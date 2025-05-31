
import { supabase } from '@/integrations/supabase/client';

export interface WebhookEndpoint {
  id?: string;
  organization_id?: string;
  url: string;
  events: string[];
  secret?: string;
  enabled?: boolean;
  retry_count?: number;
  timeout_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_id: string;
  event_type: string;
  payload: any;
  attempt: number;
  status: 'pending' | 'delivered' | 'failed' | 'dead_letter';
  created_at: string;
  delivered_at?: string;
  failed_at?: string;
  response_time_ms?: number;
  error_message?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  created: string;
  data: any;
}

export const webhookService = {
  async createWebhook(webhook: Omit<WebhookEndpoint, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<{ webhook: WebhookEndpoint; secret: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        method: 'POST',
        body: webhook
      });

      if (error) {
        console.error('Error creating webhook:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  },

  async updateWebhook(id: string, webhook: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        method: 'PUT',
        body: webhook,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error updating webhook:', error);
        throw error;
      }

      return data.webhook;
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw error;
    }
  },

  async deleteWebhook(id: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('webhook-manager', {
        method: 'DELETE'
      });

      if (error) {
        console.error('Error deleting webhook:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw error;
    }
  },

  async getWebhooks(): Promise<WebhookEndpoint[]> {
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching webhooks:', error);
        throw error;
      }

      return data.webhooks;
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  },

  async getWebhook(id: string): Promise<WebhookEndpoint> {
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching webhook:', error);
        throw error;
      }

      return data.webhook;
    } catch (error) {
      console.error('Error fetching webhook:', error);
      throw error;
    }
  },

  async testWebhook(id: string): Promise<{ message: string; event: WebhookEvent }> {
    try {
      const { data, error } = await supabase.functions.invoke('webhook-manager', {
        method: 'POST',
        body: {}
      });

      if (error) {
        console.error('Error testing webhook:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error testing webhook:', error);
      throw error;
    }
  },

  async dispatchEvent(webhookId: string, event: WebhookEvent): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('webhook-dispatcher', {
        body: {
          webhook_id: webhookId,
          event: event
        }
      });

      if (error) {
        console.error('Error dispatching webhook event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error dispatching webhook event:', error);
      throw error;
    }
  },

  async broadcastEvent(organizationId: string, event: WebhookEvent): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('webhook-dispatcher', {
        body: {
          organization_id: organizationId,
          event: event
        }
      });

      if (error) {
        console.error('Error broadcasting webhook event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error broadcasting webhook event:', error);
      throw error;
    }
  },

  async getDeliveries(filters?: {
    webhook_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<WebhookDelivery[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.webhook_id) params.append('webhook_id', filters.webhook_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const { data, error } = await supabase.functions.invoke('webhook-dispatcher', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching webhook deliveries:', error);
        throw error;
      }

      return data.deliveries;
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
      throw error;
    }
  }
};
