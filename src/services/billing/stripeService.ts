
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutSessionRequest {
  priceId: string;
  organizationId: string;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface CustomerPortalRequest {
  organizationId: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export const stripeService = {
  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: request,
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return data;
  },

  /**
   * Create a customer portal session for subscription management
   */
  async createCustomerPortalSession(request: CustomerPortalRequest): Promise<CustomerPortalResponse> {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      body: request,
    });

    if (error) {
      console.error('Error creating customer portal session:', error);
      throw new Error(error.message || 'Failed to create customer portal session');
    }

    return data;
  },

  /**
   * Open Stripe checkout in a new tab
   */
  openCheckout(checkoutUrl: string): void {
    window.open(checkoutUrl, '_blank');
  },

  /**
   * Open customer portal in a new tab
   */
  openCustomerPortal(portalUrl: string): void {
    window.open(portalUrl, '_blank');
  },
};
