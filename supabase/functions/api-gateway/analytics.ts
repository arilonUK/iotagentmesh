
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RequestMetrics {
  requestId: string;
  organizationId?: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userAgent?: string;
  ipAddress?: string;
  errorMessage?: string;
  timestamp: Date;
}

export interface AnalyticsData {
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  topEndpoints: { endpoint: string; count: number }[];
  statusCodeDistribution: { code: number; count: number }[];
  requestsOverTime: { timestamp: string; count: number }[];
}

export class AnalyticsCollector {
  private supabaseClient: ReturnType<typeof createClient>;
  private metricsBuffer: RequestMetrics[] = [];
  private bufferFlushInterval = 5000; // 5 seconds
  private maxBufferSize = 100;

  constructor() {
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Flush buffer periodically
    setInterval(() => this.flushBuffer(), this.bufferFlushInterval);
  }

  recordRequest(metrics: RequestMetrics): void {
    this.metricsBuffer.push(metrics);

    if (this.metricsBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const records = metricsToFlush.map(metrics => ({
        request_id: metrics.requestId,
        organization_id: metrics.organizationId,
        api_key_id: metrics.apiKeyId,
        endpoint: metrics.endpoint,
        method: metrics.method,
        response_status: metrics.statusCode,
        processing_time_ms: metrics.responseTime,
        request_size_bytes: metrics.requestSize,
        response_size_bytes: metrics.responseSize,
        ip_address: metrics.ipAddress,
        user_agent: metrics.userAgent,
        error_message: metrics.errorMessage,
        created_at: metrics.timestamp.toISOString()
      }));

      await this.supabaseClient
        .from('api_requests_log')
        .insert(records);

      console.log(`Flushed ${records.length} metrics to database`);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add failed metrics back to buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  async getAnalytics(organizationId: string, startDate: Date, endDate: Date): Promise<AnalyticsData> {
    try {
      const { data: requests, error } = await this.supabaseClient
        .from('api_requests_log')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      return this.processAnalyticsData(requests || []);
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  private processAnalyticsData(requests: Record<string, unknown>[]): AnalyticsData {
    const totalRequests = requests.length;
    const avgResponseTime = requests.reduce((sum, req) => sum + (req.processing_time_ms || 0), 0) / totalRequests || 0;
    const errorRequests = requests.filter(req => req.response_status >= 400);
    const errorRate = totalRequests > 0 ? (errorRequests.length / totalRequests) * 100 : 0;

    // Top endpoints
    const endpointCounts = requests.reduce((acc, req) => {
      acc[req.endpoint] = (acc[req.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Status code distribution
    const statusCounts = requests.reduce((acc, req) => {
      acc[req.response_status] = (acc[req.response_status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const statusCodeDistribution = Object.entries(statusCounts)
      .map(([code, count]) => ({ code: parseInt(code), count }))
      .sort((a, b) => a.code - b.code);

    // Requests over time (hourly buckets)
    const timeBuckets = requests.reduce((acc, req) => {
      const hour = new Date(req.created_at).toISOString().slice(0, 13) + ':00:00.000Z';
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const requestsOverTime = Object.entries(timeBuckets)
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      topEndpoints,
      statusCodeDistribution,
      requestsOverTime
    };
  }

  private getEmptyAnalytics(): AnalyticsData {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      topEndpoints: [],
      statusCodeDistribution: [],
      requestsOverTime: []
    };
  }
}

export const analyticsCollector = new AnalyticsCollector();
