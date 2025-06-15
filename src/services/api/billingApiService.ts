import { supabase } from '@/integrations/supabase/client';
import { 
  SubscriptionTier, 
  OrganizationSubscription, 
  CurrentUsage, 
  UsageLimits,
  UsageMetrics,
  DeviceConnection,
  DataVolumeUsage 
} from '@/types/billing';

export interface Payment {
  id: string;
  organization_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  created_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_pdf_url?: string;
  due_date?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

export const billingApiService = {
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

  // Usage Tracking
  async getCurrentUsage(organizationId: string): Promise<CurrentUsage> {
    const { data, error } = await supabase
      .rpc('get_organization_current_usage', { p_org_id: organizationId });

    if (error) throw error;
    return data[0];
  },

  async checkUsageLimits(organizationId: string): Promise<UsageLimits> {
    const { data, error } = await supabase
      .rpc('check_usage_limits', { p_org_id: organizationId });

    if (error) throw error;
    return data[0];
  },

  // Payments
  async getPayments(organizationId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(payment => ({
      ...payment,
      status: payment.status as 'pending' | 'succeeded' | 'failed' | 'canceled'
    }));
  },

  // Invoices
  async getInvoices(organizationId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(invoice => ({
      ...invoice,
      status: invoice.status as 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
    }));
  },

  // Usage Metrics
  async getUsageMetrics(
    organizationId: string,
    metricType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<UsageMetrics[]> {
    let query = supabase
      .from('usage_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('period_start', { ascending: false });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (startDate) {
      query = query.gte('period_start', startDate);
    }

    if (endDate) {
      query = query.lte('period_end', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(metric => ({
      ...metric,
      metadata: metric.metadata as Record<string, any>
    }));
  },

  // Device Connections
  async getDeviceConnections(
    organizationId: string,
    deviceId?: string,
    activeOnly = false
  ): Promise<DeviceConnection[]> {
    let query = supabase
      .from('device_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .order('connection_start', { ascending: false });

    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    if (activeOnly) {
      query = query.is('connection_end', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Data Volume Usage
  async getDataVolumeUsage(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    dataType?: 'ingestion' | 'egress' | 'storage'
  ): Promise<DataVolumeUsage[]> {
    let query = supabase
      .from('data_volume_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .order('recorded_at', { ascending: false });

    if (startDate) {
      query = query.gte('period_date', startDate);
    }

    if (endDate) {
      query = query.lte('period_date', endDate);
    }

    if (dataType) {
      query = query.eq('data_type', dataType);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(usage => ({
      ...usage,
      data_type: usage.data_type as 'ingestion' | 'egress' | 'storage'
    }));
  },

  // Record usage data
  async recordUsageMetric(
    organizationId: string,
    metricType: string,
    metricValue: number,
    periodStart: string,
    periodEnd: string,
    metadata: Record<string, any> = {}
  ): Promise<UsageMetrics> {
    const { data, error } = await supabase
      .from('usage_metrics')
      .insert({
        organization_id: organizationId,
        metric_type: metricType,
        metric_value: metricValue,
        period_start: periodStart,
        period_end: periodEnd,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      metadata: data.metadata as Record<string, any>
    };
  },

  async recordDataVolumeUsage(
    organizationId: string,
    deviceId: string,
    dataType: 'ingestion' | 'egress' | 'storage',
    volumeBytes: number
  ): Promise<DataVolumeUsage> {
    const { data, error } = await supabase
      .from('data_volume_usage')
      .insert({
        organization_id: organizationId,
        device_id: deviceId,
        data_type: dataType,
        volume_bytes: volumeBytes,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      data_type: data.data_type as 'ingestion' | 'egress' | 'storage'
    };
  },
};
