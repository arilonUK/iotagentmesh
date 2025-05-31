import { supabase } from '@/integrations/supabase/client';

export interface FunctionMetrics {
  functionName: string;
  totalCalls: number;
  averageResponseTime: number;
  errorRate: number;
  lastCall: string;
  status: 'healthy' | 'warning' | 'error';
}

export interface FunctionCall {
  functionName: string;
  timestamp: string;
  responseTime: number;
  success: boolean;
  error?: string;
}

class EdgeFunctionMonitoringService {
  private metrics: Map<string, FunctionCall[]> = new Map();
  private readonly maxCallsToStore = 100;

  /**
   * Record a function call for monitoring
   */
  recordFunctionCall(call: FunctionCall): void {
    const calls = this.metrics.get(call.functionName) || [];
    calls.unshift(call);
    
    // Keep only the last N calls
    if (calls.length > this.maxCallsToStore) {
      calls.splice(this.maxCallsToStore);
    }
    
    this.metrics.set(call.functionName, calls);
    
    console.log(`Function monitoring: Recorded call to ${call.functionName}`, {
      responseTime: call.responseTime,
      success: call.success,
      timestamp: call.timestamp
    });
  }

  /**
   * Get metrics for a specific function
   */
  getFunctionMetrics(functionName: string): FunctionMetrics | null {
    const calls = this.metrics.get(functionName);
    
    if (!calls || calls.length === 0) {
      return null;
    }

    const totalCalls = calls.length;
    const successfulCalls = calls.filter(call => call.success);
    const averageResponseTime = calls.reduce((sum, call) => sum + call.responseTime, 0) / totalCalls;
    const errorRate = ((totalCalls - successfulCalls.length) / totalCalls) * 100;
    const lastCall = calls[0].timestamp;

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errorRate > 50) {
      status = 'error';
    } else if (errorRate > 10 || averageResponseTime > 5000) {
      status = 'warning';
    }

    return {
      functionName,
      totalCalls,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      lastCall,
      status
    };
  }

  /**
   * Get metrics for all monitored functions
   */
  getAllMetrics(): FunctionMetrics[] {
    const allMetrics: FunctionMetrics[] = [];
    
    for (const functionName of this.metrics.keys()) {
      const metrics = this.getFunctionMetrics(functionName);
      if (metrics) {
        allMetrics.push(metrics);
      }
    }
    
    return allMetrics.sort((a, b) => 
      new Date(b.lastCall).getTime() - new Date(a.lastCall).getTime()
    );
  }

  /**
   * Test function connectivity and performance
   */
  async testFunction(functionName: string): Promise<FunctionCall> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      console.log(`Testing function: ${functionName}`);
      
      const response = await supabase.functions.invoke(functionName, {
        headers: {
          'Authorization': 'Bearer test_token',
          'Content-Type': 'application/json'
        }
      });

      success = !response.error;
      if (response.error) {
        error = response.error.message || 'Unknown error';
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Network error';
    }

    const responseTime = Date.now() - startTime;
    const call: FunctionCall = {
      functionName,
      timestamp: new Date().toISOString(),
      responseTime,
      success,
      error
    };

    this.recordFunctionCall(call);
    return call;
  }

  /**
   * Monitor API auth function specifically
   */
  async monitorApiAuth(): Promise<void> {
    console.log('Monitoring API auth functions...');
    
    const functions = [
      'api-key-validator',
      'rate-limit-checker', 
      'api-auth-orchestrator'
    ];

    const testPromises = functions.map(func => this.testFunction(func));
    
    try {
      await Promise.all(testPromises);
      console.log('API auth function monitoring complete');
    } catch (error) {
      console.error('Error monitoring API auth functions:', error);
    }
  }

  /**
   * Clear metrics for a function
   */
  clearMetrics(functionName?: string): void {
    if (functionName) {
      this.metrics.delete(functionName);
      console.log(`Cleared metrics for function: ${functionName}`);
    } else {
      this.metrics.clear();
      console.log('Cleared all function metrics');
    }
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(): string {
    const allMetrics = this.getAllMetrics();
    return JSON.stringify({
      exportTimestamp: new Date().toISOString(),
      totalFunctions: allMetrics.length,
      metrics: allMetrics,
      rawCalls: Object.fromEntries(this.metrics)
    }, null, 2);
  }
}

export const edgeFunctionMonitoringService = new EdgeFunctionMonitoringService();
