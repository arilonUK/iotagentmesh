
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitBucket {
  id: string;
  bucket_type: string;
  reset_time: string;
  current_count: number;
  limit_value: number;
}

export class RateLimiter {
  private supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async checkRateLimit(apiKeyId: string): Promise<{ allowed: boolean; resetTime?: string }> {
    const now = new Date();
    
    const { data: rateLimits } = await this.supabaseClient
      .from('rate_limit_buckets')
      .select('*')
      .eq('api_key_id', apiKeyId);

    if (!rateLimits || rateLimits.length === 0) {
      return { allowed: true };
    }

    for (const bucket of rateLimits as RateLimitBucket[]) {
      // Reset bucket if time has passed
      if (new Date(bucket.reset_time) <= now) {
        await this.resetBucket(bucket);
      } else if (bucket.current_count >= bucket.limit_value) {
        return {
          allowed: false, 
          resetTime: bucket.reset_time 
        };
      }
    }

    return { allowed: true };
  }

  async incrementRateLimit(apiKeyId: string): Promise<void> {
    const now = new Date();
    
    const { data: rateLimits } = await this.supabaseClient
      .from('rate_limit_buckets')
      .select('*')
      .eq('api_key_id', apiKeyId);

    if (rateLimits && rateLimits.length > 0) {
      for (const bucket of rateLimits as RateLimitBucket[]) {
        if (new Date(bucket.reset_time) > now) {
          await this.supabaseClient
            .from('rate_limit_buckets')
            .update({
              current_count: bucket.current_count + 1,
              updated_at: now.toISOString()
            })
            .eq('id', bucket.id);
        }
      }
    }
  }

  private async resetBucket(bucket: RateLimitBucket): Promise<void> {
    const now = new Date();
    const resetTime = bucket.bucket_type === 'hourly' 
      ? new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      : bucket.bucket_type === 'daily'
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    await this.supabaseClient
      .from('rate_limit_buckets')
      .update({
        current_count: 0,
        reset_time: resetTime,
        updated_at: now.toISOString()
      })
      .eq('id', bucket.id);
  }
}
