
import { supabase } from '@/integrations/supabase/client';

interface RateLimitCheck {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset_time: string;
  retry_after?: number;
}

interface UsageStats {
  total_requests: number;
  avg_response_time: number;
  error_rate: number;
  endpoints: string[];
  daily_breakdown: { [key: string]: number };
}

export const rateLimitService = {
  async checkRateLimit(apiKeyId: string, organizationId: string, endpoint?: string, method?: string): Promise<RateLimitCheck> {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          api_key_id: apiKeyId,
          organization_id: organizationId,
          endpoint,
          method
        }
      });

      if (error) {
        console.error('Rate limit check error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      throw error;
    }
  },

  async trackUsage(
    apiKeyId: string,
    organizationId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    options?: {
      requestSizeBytes?: number;
      responseSizeBytes?: number;
      ipAddress?: string;
      userAgent?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('usage-tracker', {
        body: {
          api_key_id: apiKeyId,
          organization_id: organizationId,
          endpoint,
          method,
          status_code: statusCode,
          response_time_ms: responseTimeMs,
          request_size_bytes: options?.requestSizeBytes,
          response_size_bytes: options?.responseSizeBytes,
          ip_address: options?.ipAddress,
          user_agent: options?.userAgent,
          error_message: options?.errorMessage
        }
      });

      if (error) {
        console.error('Usage tracking error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  },

  async getUsageStats(organizationId: string, apiKeyId?: string, days: number = 7): Promise<{ summary: UsageStats; usage_data: Record<string, unknown>[] }> {
    try {
      const params = new URLSearchParams({
        organization_id: organizationId,
        days: days.toString()
      });

      if (apiKeyId) {
        params.append('api_key_id', apiKeyId);
      }

      const { data, error } = await supabase.functions.invoke('usage-tracker', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Usage stats error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  },

  async cleanupOldUsageData(): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('usage-tracker', {
        method: 'DELETE'
      });

      if (error) {
        console.error('Cleanup error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error cleaning up usage data:', error);
      throw error;
    }
  }
};
