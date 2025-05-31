
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthResult {
  success: boolean;
  api_key_id?: string;
  organization_id?: string;
  scopes?: string[];
  error?: string;
}

export class AuthValidator {
  private supabaseClient;

  constructor() {
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async validateApiKey(providedKey: string): Promise<AuthResult> {
    // Validate API key format
    if (!providedKey.startsWith('iot_') || providedKey.length < 32) {
      return { 
        success: false, 
        error: 'Invalid API key format' 
      };
    }

    // Hash the provided key to match against database
    const encoder = new TextEncoder();
    const data = encoder.encode(providedKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Find the API key in database
    const { data: apiKey, error: keyError } = await this.supabaseClient
      .from('api_keys')
      .select(`
        id,
        organization_id,
        name,
        scopes,
        expires_at,
        is_active,
        organizations (
          id,
          name,
          subscription_plan_id
        )
      `)
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !apiKey) {
      return { 
        success: false, 
        error: 'Invalid API key' 
      };
    }

    // Check if API key is active
    if (!apiKey.is_active) {
      return { 
        success: false, 
        error: 'API key is disabled' 
      };
    }

    // Check if API key has expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return { 
        success: false, 
        error: 'API key has expired' 
      };
    }

    return {
      success: true,
      api_key_id: apiKey.id,
      organization_id: apiKey.organization_id,
      scopes: apiKey.scopes
    };
  }

  async updateLastUsed(apiKeyId: string): Promise<void> {
    const now = new Date();
    await this.supabaseClient
      .from('api_keys')
      .update({ last_used: now.toISOString() })
      .eq('id', apiKeyId);
  }
}
