
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get organization ID from request
    const { organizationId } = await req.json();
    if (!organizationId) throw new Error("organizationId is required");

    // Verify user has access to organization
    const { data: membership, error: memberError } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (memberError) {
      logStep("Membership query error", { error: memberError });
      throw new Error("User does not have access to this organization");
    }

    if (!membership) {
      logStep("No membership found");
      throw new Error("User does not have access to this organization");
    }

    logStep("Organization access verified", { role: membership.role });

    // Get organization details
    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select('stripe_customer_id, name')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      logStep("Organization query error", { error: orgError });
      throw new Error("Organization not found");
    }

    if (!organization) {
      logStep("Organization not found in database");
      throw new Error("Organization not found");
    }

    logStep("Organization found", { name: organization.name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if organization has a Stripe customer, create if not
    let customerId = organization.stripe_customer_id;
    
    if (!customerId) {
      logStep("Creating new Stripe customer for organization");
      const customer = await stripe.customers.create({
        email: user.email,
        name: organization.name,
        metadata: {
          organization_id: organizationId,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update organization with Stripe customer ID
      await supabaseClient
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId);

      logStep("Stripe customer created and organization updated", { customerId });
    } else {
      logStep("Using existing Stripe customer", { customerId });
    }

    // Create customer portal session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    logStep("Customer portal session created", { 
      sessionId: portalSession.id, 
      url: portalSession.url 
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
