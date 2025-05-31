
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export class AdvancedRateLimiter {
  private config: RateLimitConfig;
  private supabaseClient: any;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async checkRateLimit(req: Request, organizationId?: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator ? 
      this.config.keyGenerator(req) : 
      this.getDefaultKey(req, organizationId);

    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.windowMs);

    try {
      // Clean up old entries
      await this.supabaseClient
        .from('api_requests_log')
        .delete()
        .lt('created_at', windowStart.toISOString());

      // Count current requests in window
      const { data: requests, error } = await this.supabaseClient
        .from('api_requests_log')
        .select('*', { count: 'exact' })
        .eq('ip_address', key)
        .gte('created_at', windowStart.toISOString());

      if (error) throw error;

      const currentCount = requests?.length || 0;
      const remaining = Math.max(0, this.config.maxRequests - currentCount);
      const resetTime = new Date(now.getTime() + this.config.windowMs);

      if (currentCount >= this.config.maxRequests) {
        return {
          allowed: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil(this.config.windowMs / 1000)
        };
      }

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow request but log it
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: new Date(now.getTime() + this.config.windowMs)
      };
    }
  }

  private getDefaultKey(req: Request, organizationId?: string): string {
    const ip = req.headers.get('CF-Connecting-IP') || 
               req.headers.get('X-Forwarded-For') || 
               'unknown';
    
    return organizationId ? `${organizationId}:${ip}` : ip;
  }

  async recordRequest(req: Request, organizationId?: string, status?: number): Promise<void> {
    if (this.config.skipSuccessfulRequests && status && status < 400) return;
    if (this.config.skipFailedRequests && status && status >= 400) return;

    const key = this.getDefaultKey(req, organizationId);
    
    try {
      await this.supabaseClient
        .from('api_requests_log')
        .insert({
          request_id: crypto.randomUUID(),
          organization_id: organizationId,
          endpoint: new URL(req.url).pathname,
          method: req.method,
          response_status: status || 200,
          ip_address: key,
          user_agent: req.headers.get('User-Agent'),
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record request:', error);
    }
  }
}

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}): AdvancedRateLimiter => {
  const defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    ...config
  };

  return new AdvancedRateLimiter(defaultConfig);
};
