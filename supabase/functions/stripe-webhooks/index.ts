
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOKS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // For now, we'll process without signature verification
    // In production, you should set up webhook endpoint secret and verify
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      throw new Error("Invalid JSON");
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseClient, stripe);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseClient, stripe);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabaseClient);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseClient);
        break;
      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

interface StripeWebhookSession {
  id: string;
  metadata?: { organization_id?: string };
  subscription?: string;
  customer?: string;
}

interface StripeWebhookSubscription {
  id: string;
  customer: string;
  status: string;
  items: { data: Array<{ price: { id: string } }> };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

interface StripeWebhookInvoice {
  id: string;
  customer: string;
  subscription: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  due_date?: number;
  period_start?: number;
  period_end?: number;
}

interface SupabaseWebhookClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
    update: (data: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ data: unknown; error: unknown }>;
    };
    upsert: (data: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    insert: (data: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
}

async function handleCheckoutCompleted(session: StripeWebhookSession, supabaseClient: SupabaseWebhookClient, stripe: Stripe) {
  logStep("Handling checkout completed", { sessionId: session.id });
  
  const organizationId = session.metadata?.organization_id;
  if (!organizationId) {
    logStep("No organization_id in session metadata");
    return;
  }

  // Get subscription details
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await handleSubscriptionUpdated(subscription, supabaseClient, stripe);
  }
}

async function handleSubscriptionUpdated(subscription: StripeWebhookSubscription, supabaseClient: SupabaseWebhookClient, stripe: Stripe) {
  logStep("Handling subscription updated", { subscriptionId: subscription.id });

  // Get customer and organization
  const customer = await stripe.customers.retrieve(subscription.customer);
  if (!customer || customer.deleted) {
    logStep("Customer not found or deleted");
    return;
  }

  // Find organization by stripe_customer_id
  const { data: organization, error: orgError } = await supabaseClient
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customer.id)
    .single();

  if (orgError || !organization) {
    logStep("Organization not found for customer", { customerId: customer.id });
    return;
  }

  // Get subscription plan based on price
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) {
    logStep("No price ID found in subscription");
    return;
  }

  // Map Stripe price to subscription plan
  const { data: plans, error: plansError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true);

  if (plansError || !plans) {
    logStep("Error fetching subscription plans");
    return;
  }

  // For now, determine plan by price amount (you should map this properly)
  const price = await stripe.prices.retrieve(priceId);
  let planName = 'free';
  
  if (price.unit_amount) {
    if (price.unit_amount <= 2999) planName = 'professional';
    else if (price.unit_amount >= 3000) planName = 'enterprise';
  }

  const plan = plans.find(p => p.name === planName);
  if (!plan) {
    logStep("No matching plan found", { planName, priceAmount: price.unit_amount });
    return;
  }

  // Update or create organization subscription
  const { error: subError } = await supabaseClient
    .from('organization_subscriptions')
    .upsert({
      organization_id: organization.id,
      subscription_plan_id: plan.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'organization_id',
    });

  if (subError) {
    logStep("Error updating subscription", { error: subError });
  } else {
    logStep("Subscription updated successfully", { organizationId: organization.id });
  }
}

async function handleSubscriptionDeleted(subscription: StripeWebhookSubscription, supabaseClient: SupabaseWebhookClient) {
  logStep("Handling subscription deleted", { subscriptionId: subscription.id });

  // Update subscription status to canceled
  const { error } = await supabaseClient
    .from('organization_subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logStep("Error updating canceled subscription", { error });
  }
}

async function handleInvoicePaymentSucceeded(invoice: StripeWebhookInvoice, supabaseClient: SupabaseWebhookClient) {
  logStep("Handling invoice payment succeeded", { invoiceId: invoice.id });

  // Update or create invoice record
  const { error } = await supabaseClient
    .from('invoices')
    .upsert({
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: invoice.subscription,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      status: invoice.status,
      invoice_pdf_url: invoice.invoice_pdf,
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_invoice_id',
    });

  if (error) {
    logStep("Error updating invoice", { error });
  }
}

async function handleInvoicePaymentFailed(invoice: StripeWebhookInvoice, supabaseClient: SupabaseWebhookClient) {
  logStep("Handling invoice payment failed", { invoiceId: invoice.id });

  // Update invoice status
  const { error } = await supabaseClient
    .from('invoices')
    .upsert({
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: invoice.subscription,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      status: 'uncollectible',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_invoice_id',
    });

  if (error) {
    logStep("Error updating failed invoice", { error });
  }
}
