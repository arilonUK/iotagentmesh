
import { supabase } from '@/integrations/supabase/client';
import { CurrentUsage, UsageLimits, UsageMetrics } from '@/types/billing';

export const usageService = {
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
};
