
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionTier, OrganizationSubscription } from '@/types/billing';

export const subscriptionService = {
  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionTier[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    
    return data.map(plan => ({
      ...plan,
      billing_interval: plan.billing_interval as 'monthly' | 'yearly',
      features: {
        max_devices: plan.max_devices,
        max_api_calls_per_month: plan.max_api_calls_per_month,
        max_data_retention_days: plan.max_data_retention_days,
        advanced_analytics: plan.advanced_analytics,
        priority_support: plan.priority_support,
      }
    }));
  },

  // Organization Subscriptions
  async getOrganizationSubscription(organizationId: string): Promise<OrganizationSubscription | null> {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    return {
      ...data,
      status: data.status as 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
    };
  },

  async createOrganizationSubscription(
    organizationId: string, 
    subscriptionPlanId: string
  ): Promise<OrganizationSubscription> {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .insert({
        organization_id: organizationId,
        subscription_plan_id: subscriptionPlanId,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
    };
  },
};
