import { ExternalApiService, ExternalApiConfig } from '../base/ExternalApiService';

// IoT Agent Mesh API Types
export interface IoTAgent {
  id: string;
  name: string;
  type: 'device' | 'gateway' | 'edge';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  version: string;
  capabilities: string[];
  endpoint: string;
  last_seen: string;
  metadata: Record<string, unknown>;
}

export interface IoTDevice {
  id: string;
  agent_id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  properties: Record<string, unknown>;
  telemetry_config: {
    interval: number;
    metrics: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface TelemetryData {
  device_id: string;
  timestamp: string;
  metrics: {
    [key: string]: {
      value: number | string | boolean;
      unit?: string;
      quality?: 'good' | 'bad' | 'uncertain';
    };
  };
  metadata?: Record<string, unknown>;
}

export interface AgentCommand {
  id: string;
  agent_id: string;
  command: string;
  parameters: Record<string, unknown>;
  timeout: number;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'timeout';
  result?: unknown;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface MCPStatus {
  server_id: string;
  status: 'running' | 'stopped' | 'error';
  agents_connected: number;
  events_processed: number;
  last_heartbeat: string;
  version: string;
}

// Request DTOs
export interface CreateAgentRequest {
  name: string;
  type: 'device' | 'gateway' | 'edge';
  endpoint: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentRequest {
  name?: string;
  status?: 'online' | 'offline' | 'error' | 'maintenance';
  capabilities?: string[];
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDeviceRequest {
  agent_id: string;
  name: string;
  type: string;
  properties?: Record<string, unknown>;
  telemetry_config?: {
    interval: number;
    metrics: string[];
  };
}

export interface UpdateDeviceRequest {
  name?: string;
  status?: 'active' | 'inactive' | 'error';
  properties?: Record<string, unknown>;
  telemetry_config?: {
    interval: number;
    metrics: string[];
  };
}

export interface SendCommandRequest {
  command: string;
  parameters: Record<string, unknown>;
  timeout?: number;
}

export interface TelemetryUploadRequest {
  device_id: string;
  metrics: {
    [key: string]: {
      value: number | string | boolean;
      unit?: string;
      quality?: 'good' | 'bad' | 'uncertain';
    };
  };
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface MCPEventRequest {
  event_type: string;
  source_agent_id: string;
  target_agent_ids?: string[];
  payload: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export class IoTAgentMeshApiService extends ExternalApiService<IoTAgent, CreateAgentRequest, UpdateAgentRequest> {
  protected readonly config: ExternalApiConfig = {
    baseUrl: 'https://api.iotagentmesh.com/v1',
    defaultHeaders: {
      'Accept': 'application/json',
      'X-Client': 'iotagentmesh-dashboard'
    },
    timeout: 30000,
    retryAttempts: 3
  };

  protected readonly entityName = 'IoT Agent';

  // Agent Management
  async fetchAll(): Promise<IoTAgent[]> {
    try {
      console.log('Fetching all IoT agents');
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ agents: IoTAgent[] }>({
          method: 'GET',
          endpoint: '/agents'
        })
      );

      return response.agents || [];
    } catch (error) {
      console.error('Error fetching IoT agents:', error);
      return [];
    }
  }

  async fetchById(id: string): Promise<IoTAgent | null> {
    try {
      console.log(`Fetching IoT agent: ${id}`);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ agent: IoTAgent }>({
          method: 'GET',
          endpoint: `/agents/${id}`
        })
      );

      return response.agent || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error fetching IoT agent:', error);
      this.handleError(error, 'fetch agent');
    }
  }

  async create(data: CreateAgentRequest): Promise<IoTAgent> {
    try {
      console.log('Creating IoT agent:', data);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ agent: IoTAgent }>({
          method: 'POST',
          endpoint: '/agents',
          data
        })
      );

      console.log('IoT agent created successfully');
      return response.agent;
    } catch (error) {
      console.error('Error creating IoT agent:', error);
      this.handleError(error, 'create agent');
    }
  }

  async update(id: string, data: UpdateAgentRequest): Promise<IoTAgent> {
    try {
      console.log(`Updating IoT agent ${id}:`, data);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ agent: IoTAgent }>({
          method: 'PUT',
          endpoint: `/agents/${id}`,
          data
        })
      );

      console.log('IoT agent updated successfully');
      return response.agent;
    } catch (error) {
      console.error('Error updating IoT agent:', error);
      this.handleError(error, 'update agent');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Deleting IoT agent: ${id}`);
      
      await this.retryRequest(() =>
        this.makeExternalRequest({
          method: 'DELETE',
          endpoint: `/agents/${id}`
        })
      );

      console.log('IoT agent deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting IoT agent:', error);
      this.handleError(error, 'delete agent');
    }
  }

  // Agent Status
  async getAgentStatus(agentId: string): Promise<{ status: string; last_seen: string; metadata: Record<string, unknown> } | null> {
    try {
      console.log(`Getting agent status: ${agentId}`);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ status: string; last_seen: string; metadata: Record<string, unknown> }>({
          method: 'GET',
          endpoint: `/agents/${agentId}/status`
        })
      );

      return response;
    } catch (error) {
      console.error('Error getting agent status:', error);
      return null;
    }
  }

  // Agent Commands
  async sendCommand(agentId: string, command: SendCommandRequest): Promise<AgentCommand> {
    try {
      console.log(`Sending command to agent ${agentId}:`, command);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ command: AgentCommand }>({
          method: 'POST',
          endpoint: `/agents/${agentId}/commands`,
          data: command
        })
      );

      return response.command;
    } catch (error) {
      console.error('Error sending command:', error);
      this.handleError(error, 'send command');
    }
  }

  async getCommandStatus(agentId: string, commandId: string): Promise<AgentCommand | null> {
    try {
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ command: AgentCommand }>({
          method: 'GET',
          endpoint: `/agents/${agentId}/commands/${commandId}`
        })
      );

      return response.command || null;
    } catch (error) {
      console.error('Error getting command status:', error);
      return null;
    }
  }

  // Device Management
  async getDevices(agentId?: string): Promise<IoTDevice[]> {
    try {
      const endpoint = agentId ? `/agents/${agentId}/devices` : '/devices';
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ devices: IoTDevice[] }>({
          method: 'GET',
          endpoint
        })
      );

      return response.devices || [];
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }

  async createDevice(data: CreateDeviceRequest): Promise<IoTDevice> {
    try {
      console.log('Creating device:', data);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ device: IoTDevice }>({
          method: 'POST',
          endpoint: '/devices',
          data
        })
      );

      return response.device;
    } catch (error) {
      console.error('Error creating device:', error);
      this.handleError(error, 'create device');
    }
  }

  async updateDevice(deviceId: string, data: UpdateDeviceRequest): Promise<IoTDevice> {
    try {
      console.log(`Updating device ${deviceId}:`, data);
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ device: IoTDevice }>({
          method: 'PUT',
          endpoint: `/devices/${deviceId}`,
          data
        })
      );

      return response.device;
    } catch (error) {
      console.error('Error updating device:', error);
      this.handleError(error, 'update device');
    }
  }

  // Telemetry
  async uploadTelemetry(data: TelemetryUploadRequest): Promise<boolean> {
    try {
      console.log('Uploading telemetry data:', data);
      
      await this.retryRequest(() =>
        this.makeExternalRequest({
          method: 'POST',
          endpoint: '/telemetry',
          data
        })
      );

      return true;
    } catch (error) {
      console.error('Error uploading telemetry:', error);
      return false;
    }
  }

  async getSensorData(deviceId: string, sensorId: string, startTime?: string, endTime?: string): Promise<TelemetryData[]> {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('start_time', startTime);
      if (endTime) params.append('end_time', endTime);
      
      const queryString = params.toString();
      const endpoint = `/sensors/${sensorId}/data${queryString ? '?' + queryString : ''}`;
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ data: TelemetryData[] }>({
          method: 'GET',
          endpoint
        })
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return [];
    }
  }

  async getTimeSeriesData(deviceId: string, metric: string, startTime: string, endTime: string): Promise<TelemetryData[]> {
    try {
      const params = new URLSearchParams({
        device_id: deviceId,
        metric,
        start_time: startTime,
        end_time: endTime
      });
      
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<{ data: TelemetryData[] }>({
          method: 'GET',
          endpoint: `/data/timeseries?${params.toString()}`
        })
      );

      return response.data || [];
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  }

  // MCP (Multi-Agent Control Platform)
  async getMCPStatus(): Promise<MCPStatus | null> {
    try {
      const response = await this.retryRequest(() =>
        this.makeExternalRequest<MCPStatus>({
          method: 'GET',
          endpoint: '/mcp/status'
        })
      );

      return response;
    } catch (error) {
      console.error('Error getting MCP status:', error);
      return null;
    }
  }

  async coordinateAgents(agentIds: string[], coordination: Record<string, unknown>): Promise<boolean> {
    try {
      console.log('Coordinating agents:', { agentIds, coordination });
      
      await this.retryRequest(() =>
        this.makeExternalRequest({
          method: 'POST',
          endpoint: '/mcp/coordinate',
          data: {
            agent_ids: agentIds,
            coordination
          }
        })
      );

      return true;
    } catch (error) {
      console.error('Error coordinating agents:', error);
      return false;
    }
  }

  async processEvent(event: MCPEventRequest): Promise<boolean> {
    try {
      console.log('Processing MCP event:', event);
      
      await this.retryRequest(() =>
        this.makeExternalRequest({
          method: 'POST',
          endpoint: '/mcp/events',
          data: event
        })
      );

      return true;
    } catch (error) {
      console.error('Error processing event:', error);
      return false;
    }
  }

  // Configuration
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
  }
}

// Create singleton instance
export const iotAgentMeshApiService = new IoTAgentMeshApiService();