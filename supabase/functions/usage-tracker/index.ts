
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UsageTrackingRequest {
  api_key_id: string;
  organization_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  request_size_bytes?: number;
  response_size_bytes?: number;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Log API usage
      const usageData: UsageTrackingRequest = await req.json()
      
      // Insert usage record
      const { error: usageError } = await supabaseClient
        .from('api_usage')
        .insert({
          api_key_id: usageData.api_key_id,
          organization_id: usageData.organization_id,
          endpoint: usageData.endpoint,
          method: usageData.method,
          status_code: usageData.status_code,
          response_time_ms: usageData.response_time_ms,
          request_size_bytes: usageData.request_size_bytes,
          response_size_bytes: usageData.response_size_bytes,
          ip_address: usageData.ip_address,
          user_agent: usageData.user_agent
        })

      if (usageError) {
        console.error('Error logging usage:', usageError)
        return new Response(
          JSON.stringify({ error: 'Failed to log usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Also log detailed request information
      const { error: logError } = await supabaseClient
        .from('api_requests_log')
        .insert({
          api_key_id: usageData.api_key_id,
          organization_id: usageData.organization_id,
          request_id: crypto.randomUUID(),
          endpoint: usageData.endpoint,
          method: usageData.method,
          response_status: usageData.status_code,
          processing_time_ms: usageData.response_time_ms,
          error_message: usageData.error_message,
          ip_address: usageData.ip_address,
          user_agent: usageData.user_agent
        })

      if (logError) {
        console.error('Error logging request:', logError)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get usage statistics
      const url = new URL(req.url)
      const organizationId = url.searchParams.get('organization_id')
      const apiKeyId = url.searchParams.get('api_key_id')
      const days = parseInt(url.searchParams.get('days') || '7')

      if (!organizationId) {
        return new Response(
          JSON.stringify({ error: 'organization_id parameter required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      let query = supabaseClient
        .from('api_usage')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())

      if (apiKeyId) {
        query = query.eq('api_key_id', apiKeyId)
      }

      const { data: usageData, error: usageError } = await query
        .order('created_at', { ascending: false })
        .limit(1000)

      if (usageError) {
        console.error('Error fetching usage data:', usageError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch usage data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate usage summary
      const summary = {
        total_requests: usageData?.length || 0,
        avg_response_time: usageData?.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / (usageData?.length || 1),
        error_rate: usageData?.filter(item => item.status_code >= 400).length / (usageData?.length || 1),
        endpoints: [...new Set(usageData?.map(item => item.endpoint) || [])],
        daily_breakdown: generateDailyBreakdown(usageData || [], days)
      }

      return new Response(
        JSON.stringify({
          summary,
          usage_data: usageData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      // Clean up old usage data (maintenance endpoint)
      const retentionDays = 90

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const { error: cleanupError } = await supabaseClient
        .from('api_usage')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (cleanupError) {
        console.error('Error cleaning up usage data:', cleanupError)
        return new Response(
          JSON.stringify({ error: 'Failed to clean up usage data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Also clean up old request logs
      const logCutoffDate = new Date()
      logCutoffDate.setDate(logCutoffDate.getDate() - 30)

      await supabaseClient
        .from('api_requests_log')
        .delete()
        .lt('created_at', logCutoffDate.toISOString())

      return new Response(
        JSON.stringify({ success: true, message: 'Old usage data cleaned up' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in usage-tracker function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateDailyBreakdown(usageData: any[], days: number) {
  const breakdown: { [key: string]: number } = {}
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    breakdown[dateKey] = 0
  }

  usageData.forEach(usage => {
    const dateKey = usage.created_at.split('T')[0]
    if (breakdown.hasOwnProperty(dateKey)) {
      breakdown[dateKey]++
    }
  })

  return breakdown
}
