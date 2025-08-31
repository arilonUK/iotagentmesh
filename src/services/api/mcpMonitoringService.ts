import { iotAgentMeshApiService, MCPStatus, MCPEventRequest } from './iotAgentMeshApiService';
import { agentManagementService } from './agentManagementService';
import { toast } from 'sonner';

export interface MCPHealthMetrics {
  server_status: 'running' | 'stopped' | 'error' | 'degraded';
  agents_connected: number;
  agents_healthy: number;
  events_processed_last_hour: number;
  average_response_time: number;
  error_rate: number;
  uptime_percentage: number;
  memory_usage: number;
  cpu_usage: number;
  last_heartbeat: string;
}

export interface EventProcessingStats {
  total_events: number;
  successful_events: number;
  failed_events: number;
  pending_events: number;
  average_processing_time: number;
  events_by_type: Record<string, number>;
  events_by_priority: Record<string, number>;
}

export interface CoordinationTask {
  id: string;
  name: string;
  description: string;
  agent_ids: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
  error_message?: string;
  configuration: Record<string, unknown>;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export class MCPMonitoringService {
  private readonly meshService = iotAgentMeshApiService;
  private readonly agentService = agentManagementService;
  private monitoringInterval = 15000; // 15 seconds
  private monitoringTimer?: NodeJS.Timeout;
  private healthMetricsCache?: MCPHealthMetrics;
  private alertsCache: SystemAlert[] = [];
  private eventStatsCache?: EventProcessingStats;

  constructor() {
    this.startMonitoring();
  }

  async getMCPStatus(): Promise<MCPStatus | null> {
    try {
      console.log('Fetching MCP status');
      return await this.meshService.getMCPStatus();
    } catch (error) {
      console.error('Error fetching MCP status:', error);
      return null;
    }
  }

  async getHealthMetrics(): Promise<MCPHealthMetrics | null> {
    try {
      console.log('Calculating MCP health metrics');
      
      const mcpStatus = await this.getMCPStatus();
      if (!mcpStatus) {
        return this.createOfflineHealthMetrics();
      }

      const agentHealthStatus = this.agentService.getHealthStatus();
      
      // Calculate health metrics
      const healthMetrics: MCPHealthMetrics = {
        server_status: mcpStatus.status,
        agents_connected: mcpStatus.agents_connected,
        agents_healthy: agentHealthStatus.online,
        events_processed_last_hour: Math.floor(mcpStatus.events_processed * 0.1), // Simulate hourly rate
        average_response_time: Math.random() * 200 + 50, // Simulated
        error_rate: Math.random() * 5, // Simulated percentage
        uptime_percentage: this.calculateUptimePercentage(mcpStatus),
        memory_usage: Math.random() * 80 + 10, // Simulated percentage
        cpu_usage: Math.random() * 70 + 5, // Simulated percentage
        last_heartbeat: mcpStatus.last_heartbeat
      };

      this.healthMetricsCache = healthMetrics;
      this.checkForAlerts(healthMetrics);
      
      return healthMetrics;
    } catch (error) {
      console.error('Error calculating health metrics:', error);
      return this.healthMetricsCache || this.createOfflineHealthMetrics();
    }
  }

  async getEventProcessingStats(): Promise<EventProcessingStats> {
    try {
      console.log('Fetching event processing statistics');
      
      // In a real implementation, this would come from the MCP server
      // For now, we'll simulate realistic data
      const mcpStatus = await this.getMCPStatus();
      const totalEvents = mcpStatus?.events_processed || 0;
      
      const stats: EventProcessingStats = {
        total_events: totalEvents,
        successful_events: Math.floor(totalEvents * 0.92),
        failed_events: Math.floor(totalEvents * 0.05),
        pending_events: Math.floor(totalEvents * 0.03),
        average_processing_time: Math.random() * 500 + 100, // milliseconds
        events_by_type: {
          'device_alert': Math.floor(totalEvents * 0.4),
          'telemetry_data': Math.floor(totalEvents * 0.3),
          'agent_command': Math.floor(totalEvents * 0.2),
          'system_notification': Math.floor(totalEvents * 0.1)
        },
        events_by_priority: {
          'critical': Math.floor(totalEvents * 0.05),
          'high': Math.floor(totalEvents * 0.15),
          'normal': Math.floor(totalEvents * 0.70),
          'low': Math.floor(totalEvents * 0.10)
        }
      };

      this.eventStatsCache = stats;
      return stats;
    } catch (error) {
      console.error('Error fetching event processing stats:', error);
      return this.eventStatsCache || this.createEmptyEventStats();
    }
  }

  async coordinateAgents(agentIds: string[], coordination: Record<string, unknown>): Promise<CoordinationTask> {
    try {
      console.log('Starting agent coordination:', { agentIds, coordination });
      
      // Create coordination task
      const task: CoordinationTask = {
        id: `coord_${Date.now()}`,
        name: (coordination.name as string) || 'Agent Coordination Task',
        description: (coordination.description as string) || 'Coordinated action across multiple agents',
        agent_ids: agentIds,
        status: 'pending',
        created_at: new Date().toISOString(),
        progress_percentage: 0,
        configuration: coordination
      };

      // Start coordination
      const success = await this.meshService.coordinateAgents(agentIds, coordination);
      
      if (success) {
        task.status = 'running';
        task.started_at = new Date().toISOString();
        toast.success(`Coordination task started with ${agentIds.length} agents`);
      } else {
        task.status = 'failed';
        task.error_message = 'Failed to start coordination';
        toast.error('Failed to start agent coordination');
      }

      return task;
    } catch (error) {
      console.error('Error coordinating agents:', error);
      toast.error('Failed to coordinate agents');
      throw error;
    }
  }

  async processEvent(event: MCPEventRequest): Promise<boolean> {
    try {
      console.log('Processing MCP event:', event);
      
      const success = await this.meshService.processEvent(event);
      
      if (success) {
        toast.success(`Event "${event.event_type}" processed successfully`);
        
        // Add to alerts if it's a critical event
        if (event.priority === 'critical') {
          this.addAlert({
            type: 'critical',
            title: 'Critical Event Processed',
            message: `Critical event "${event.event_type}" from agent ${event.source_agent_id}`,
            source: 'MCP Event Processor',
            metadata: event as unknown as Record<string, unknown>
          });
        }
      } else {
        toast.error(`Failed to process event "${event.event_type}"`);
      }
      
      return success;
    } catch (error) {
      console.error('Error processing event:', error);
      toast.error('Failed to process MCP event');
      return false;
    }
  }

  async getSystemAlerts(includeResolved: boolean = false): Promise<SystemAlert[]> {
    if (includeResolved) {
      return this.alertsCache;
    }
    
    return this.alertsCache.filter(alert => !alert.resolved);
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const alert = this.alertsCache.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        toast.success('Alert acknowledged');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    }
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const alert = this.alertsCache.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        alert.acknowledged = true;
        toast.success('Alert resolved');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  async restartMCPServer(): Promise<boolean> {
    try {
      console.log('Attempting to restart MCP server');
      
      // This would typically be a special admin command
      const event: MCPEventRequest = {
        event_type: 'system_restart',
        source_agent_id: 'admin_console',
        payload: {
          component: 'mcp_server',
          restart_type: 'graceful'
        },
        priority: 'high'
      };

      const success = await this.processEvent(event);
      
      if (success) {
        toast.success('MCP server restart initiated');
        this.addAlert({
          type: 'info',
          title: 'MCP Server Restart',
          message: 'MCP server restart has been initiated',
          source: 'System Administration'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error restarting MCP server:', error);
      toast.error('Failed to restart MCP server');
      return false;
    }
  }

  async getServerLogs(lines: number = 100): Promise<string[]> {
    try {
      console.log(`Fetching last ${lines} server log lines`);
      
      // This would typically be retrieved from the MCP server
      // For now, we'll simulate log entries
      const logs: string[] = [];
      const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
      const components = ['EventProcessor', 'AgentManager', 'CoordinationEngine', 'HealthMonitor'];
      
      for (let i = 0; i < lines; i++) {
        const timestamp = new Date(Date.now() - i * 60000).toISOString();
        const level = logTypes[Math.floor(Math.random() * logTypes.length)];
        const component = components[Math.floor(Math.random() * components.length)];
        const messages = [
          'Agent heartbeat received',
          'Event processed successfully',
          'Coordination task completed',
          'Health check passed',
          'Configuration updated',
          'Connection established',
          'Data synchronized'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        logs.push(`${timestamp} [${level}] ${component}: ${message}`);
      }
      
      return logs.reverse(); // Most recent first
    } catch (error) {
      console.error('Error fetching server logs:', error);
      return [];
    }
  }

  private startMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    this.monitoringTimer = setInterval(async () => {
      try {
        await this.getHealthMetrics();
        await this.getEventProcessingStats();
      } catch (error) {
        console.error('Error in MCP monitoring:', error);
      }
    }, this.monitoringInterval);
  }

  stopMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
  }

  private createOfflineHealthMetrics(): MCPHealthMetrics {
    return {
      server_status: 'error',
      agents_connected: 0,
      agents_healthy: 0,
      events_processed_last_hour: 0,
      average_response_time: 0,
      error_rate: 100,
      uptime_percentage: 0,
      memory_usage: 0,
      cpu_usage: 0,
      last_heartbeat: ''
    };
  }

  private createEmptyEventStats(): EventProcessingStats {
    return {
      total_events: 0,
      successful_events: 0,
      failed_events: 0,
      pending_events: 0,
      average_processing_time: 0,
      events_by_type: {},
      events_by_priority: {}
    };
  }

  private calculateUptimePercentage(mcpStatus: MCPStatus): number {
    // Simple uptime calculation based on status
    if (mcpStatus.status === 'running') return 99.9;
    if (mcpStatus.status === 'error') return 0;
    return 50; // degraded state
  }

  private checkForAlerts(metrics: MCPHealthMetrics): void {
    // Check for various alert conditions
    if (metrics.server_status === 'error') {
      this.addAlert({
        type: 'critical',
        title: 'MCP Server Down',
        message: 'The MCP server is not responding',
        source: 'Health Monitor'
      });
    }

    if (metrics.error_rate > 10) {
      this.addAlert({
        type: 'warning',
        title: 'High Error Rate',
        message: `Error rate is ${metrics.error_rate.toFixed(1)}%`,
        source: 'Health Monitor'
      });
    }

    if (metrics.cpu_usage > 80) {
      this.addAlert({
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is at ${metrics.cpu_usage.toFixed(1)}%`,
        source: 'Resource Monitor'
      });
    }

    if (metrics.memory_usage > 85) {
      this.addAlert({
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is at ${metrics.memory_usage.toFixed(1)}%`,
        source: 'Resource Monitor'
      });
    }
  }

  private addAlert(alertData: Omit<SystemAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>): void {
    // Check if similar alert already exists
    const existingAlert = this.alertsCache.find(
      alert => 
        alert.title === alertData.title && 
        alert.source === alertData.source && 
        !alert.resolved
    );

    if (existingAlert) {
      // Update existing alert timestamp
      existingAlert.timestamp = new Date().toISOString();
      return;
    }

    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      ...alertData
    };

    this.alertsCache.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alertsCache.length > 100) {
      this.alertsCache = this.alertsCache.slice(0, 100);
    }
  }
}

export const mcpMonitoringService = new MCPMonitoringService();
