
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { organizationId } = await req.json()

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'Organization ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the free plan
    const { data: freePlan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('id')
      .eq('name', 'free')
      .eq('is_active', true)
      .single()

    if (planError || !freePlan) {
      console.error('Error finding free plan:', planError)
      return new Response(JSON.stringify({ error: 'Free plan not found' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Assign the free plan to the organization
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('organization_subscriptions')
      .insert({
        organization_id: organizationId,
        subscription_plan_id: freePlan.id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now for free plan
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return new Response(JSON.stringify({ error: 'Failed to assign free plan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Successfully assigned free plan to organization:', organizationId)

    return new Response(JSON.stringify({ 
      success: true, 
      subscription: subscription 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in assign-free-plan:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
