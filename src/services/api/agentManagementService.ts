import { iotAgentMeshApiService, IoTAgent, CreateAgentRequest, UpdateAgentRequest, SendCommandRequest, AgentCommand } from './iotAgentMeshApiService';
import { toast } from 'sonner';

export interface AgentWithHealth extends IoTAgent {
  health_score: number;
  connection_quality: 'excellent' | 'good' | 'fair' | 'poor';
  devices_count: number;
  commands_pending: number;
  last_command_at?: string;
  uptime_percentage: number;
}

export interface AgentMetrics {
  agent_id: string;
  cpu_usage: number;
  memory_usage: number;
  network_latency: number;
  commands_processed: number;
  errors_count: number;
  uptime_seconds: number;
  timestamp: string;
}

export interface CommandHistory {
  id: string;
  agent_id: string;
  command: string;
  status: string;
  created_at: string;
  completed_at?: string;
  duration_ms?: number;
  result?: unknown;
  error?: string;
}

export class AgentManagementService {
  private readonly meshService = iotAgentMeshApiService;
  private readonly healthCheckInterval = 30000; // 30 seconds
  private healthCheckTimer?: NodeJS.Timeout;
  private agentHealthCache = new Map<string, AgentWithHealth>();

  constructor() {
    this.startHealthMonitoring();
  }

  async getAllAgents(): Promise<AgentWithHealth[]> {
    try {
      console.log('Fetching all agents with health data');
      
      const agents = await this.meshService.fetchAll();
      const agentsWithHealth: AgentWithHealth[] = [];

      for (const agent of agents) {
        const healthData = await this.calculateAgentHealth(agent);
        agentsWithHealth.push(healthData);
        this.agentHealthCache.set(agent.id, healthData);
      }

      return agentsWithHealth;
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Return cached data if available
      return Array.from(this.agentHealthCache.values());
    }
  }

  async getAgent(agentId: string): Promise<AgentWithHealth | null> {
    try {
      const agent = await this.meshService.fetchById(agentId);
      if (!agent) return null;

      const healthData = await this.calculateAgentHealth(agent);
      this.agentHealthCache.set(agentId, healthData);
      
      return healthData;
    } catch (error) {
      console.error('Error fetching agent:', error);
      // Return cached data if available
      return this.agentHealthCache.get(agentId) || null;
    }
  }

  async createAgent(data: CreateAgentRequest): Promise<AgentWithHealth> {
    try {
      console.log('Creating new agent:', data);
      
      const agent = await this.meshService.create(data);
      const healthData = await this.calculateAgentHealth(agent);
      
      this.agentHealthCache.set(agent.id, healthData);
      toast.success(`Agent "${agent.name}" created successfully`);
      
      return healthData;
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
      throw error;
    }
  }

  async updateAgent(agentId: string, data: UpdateAgentRequest): Promise<AgentWithHealth> {
    try {
      console.log(`Updating agent ${agentId}:`, data);
      
      const agent = await this.meshService.update(agentId, data);
      const healthData = await this.calculateAgentHealth(agent);
      
      this.agentHealthCache.set(agentId, healthData);
      toast.success(`Agent "${agent.name}" updated successfully`);
      
      return healthData;
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      console.log(`Deleting agent: ${agentId}`);
      
      const success = await this.meshService.delete(agentId);
      
      if (success) {
        this.agentHealthCache.delete(agentId);
        toast.success('Agent deleted successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
      return false;
    }
  }

  async sendCommand(agentId: string, command: SendCommandRequest): Promise<AgentCommand> {
    try {
      console.log(`Sending command to agent ${agentId}:`, command);
      
      const commandResult = await this.meshService.sendCommand(agentId, command);
      
      toast.success(`Command "${command.command}" sent successfully`);
      return commandResult;
    } catch (error) {
      console.error('Error sending command:', error);
      toast.error('Failed to send command');
      throw error;
    }
  }

  async getCommandStatus(agentId: string, commandId: string): Promise<AgentCommand | null> {
    try {
      return await this.meshService.getCommandStatus(agentId, commandId);
    } catch (error) {
      console.error('Error getting command status:', error);
      return null;
    }
  }

  async getAgentDevices(agentId: string) {
    try {
      return await this.meshService.getDevices(agentId);
    } catch (error) {
      console.error('Error fetching agent devices:', error);
      return [];
    }
  }

  async getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
    try {
      // This would typically come from a dedicated metrics endpoint
      // For now, we'll simulate based on agent status
      const agent = await this.meshService.fetchById(agentId);
      if (!agent) return null;

      const lastSeenTime = new Date(agent.last_seen).getTime();
      const now = Date.now();
      const timeDiff = now - lastSeenTime;

      return {
        agent_id: agentId,
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        network_latency: Math.random() * 200,
        commands_processed: Math.floor(Math.random() * 1000),
        errors_count: Math.floor(Math.random() * 10),
        uptime_seconds: Math.max(0, Math.floor((now - timeDiff) / 1000)),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching agent metrics:', error);
      return null;
    }
  }

  async restartAgent(agentId: string): Promise<boolean> {
    try {
      console.log(`Restarting agent: ${agentId}`);
      
      const command: SendCommandRequest = {
        command: 'restart',
        parameters: {},
        timeout: 60
      };

      await this.sendCommand(agentId, command);
      toast.success('Agent restart command sent');
      return true;
    } catch (error) {
      console.error('Error restarting agent:', error);
      toast.error('Failed to restart agent');
      return false;
    }
  }

  async updateAgentConfig(agentId: string, config: Record<string, any>): Promise<boolean> {
    try {
      console.log(`Updating agent ${agentId} configuration:`, config);
      
      const command: SendCommandRequest = {
        command: 'update_config',
        parameters: { config },
        timeout: 30
      };

      await this.sendCommand(agentId, command);
      toast.success('Agent configuration update command sent');
      return true;
    } catch (error) {
      console.error('Error updating agent config:', error);
      toast.error('Failed to update agent configuration');
      return false;
    }
  }

  private async calculateAgentHealth(agent: IoTAgent): Promise<AgentWithHealth> {
    try {
      const lastSeenTime = new Date(agent.last_seen).getTime();
      const now = Date.now();
      const timeDiffMinutes = (now - lastSeenTime) / (1000 * 60);

      // Calculate health score based on various factors
      let healthScore = 100;
      
      // Deduct points based on last seen time
      if (timeDiffMinutes > 5) healthScore -= 20;
      if (timeDiffMinutes > 15) healthScore -= 30;
      if (timeDiffMinutes > 60) healthScore -= 40;

      // Adjust based on status
      if (agent.status === 'offline') healthScore = Math.min(healthScore, 20);
      if (agent.status === 'error') healthScore = Math.min(healthScore, 10);
      if (agent.status === 'maintenance') healthScore = Math.min(healthScore, 50);

      healthScore = Math.max(0, healthScore);

      // Determine connection quality
      let connectionQuality: AgentWithHealth['connection_quality'] = 'excellent';
      if (healthScore < 80) connectionQuality = 'good';
      if (healthScore < 60) connectionQuality = 'fair';
      if (healthScore < 40) connectionQuality = 'poor';

      // Get device count (simulated for now)
      const devices = await this.meshService.getDevices(agent.id).catch(() => []);
      
      // Calculate uptime percentage (simulated)
      const uptimePercentage = Math.max(0, Math.min(100, healthScore + Math.random() * 10));

      return {
        ...agent,
        health_score: healthScore,
        connection_quality: connectionQuality,
        devices_count: devices.length,
        commands_pending: Math.floor(Math.random() * 5), // Simulated
        uptime_percentage: uptimePercentage
      };
    } catch (error) {
      console.error('Error calculating agent health:', error);
      
      // Return agent with poor health on error
      return {
        ...agent,
        health_score: 0,
        connection_quality: 'poor',
        devices_count: 0,
        commands_pending: 0,
        uptime_percentage: 0
      };
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        console.log('Running scheduled health check for all agents');
        const agents = await this.meshService.fetchAll();
        
        for (const agent of agents) {
          const healthData = await this.calculateAgentHealth(agent);
          this.agentHealthCache.set(agent.id, healthData);
        }
      } catch (error) {
        console.error('Error in health monitoring:', error);
      }
    }, this.healthCheckInterval);
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  getHealthStatus(): { online: number; offline: number; error: number; total: number } {
    const agents = Array.from(this.agentHealthCache.values());
    
    return {
      online: agents.filter(a => a.status === 'online').length,
      offline: agents.filter(a => a.status === 'offline').length,
      error: agents.filter(a => a.status === 'error').length,
      total: agents.length
    };
  }
}

export const agentManagementService = new AgentManagementService();