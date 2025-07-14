import { supabase } from '@/integrations/supabase/client';

export interface IoTMeshGatewayRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  agentId?: string;
}

export interface IoTMeshGatewayResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export class IoTAgentMeshGatewayService {
  private readonly baseUrl: string;

  constructor() {
    // Use the edge function as our gateway
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://tuevghmlxosxuszxjral.supabase.co'}/functions/v1`;
  }

  async makeRequest<T = any>(request: IoTMeshGatewayRequest): Promise<IoTMeshGatewayResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session');
      }

      console.log('Making IoT Mesh gateway request:', request);

      const response = await supabase.functions.invoke('iot-agent-mesh-proxy', {
        body: request,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Gateway request failed');
      }

      return {
        data: response.data,
        status: 200
      };

    } catch (error) {
      console.error('IoT Mesh gateway error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  // Device Management through Gateway
  async getDevices(agentId?: string): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/devices',
      method: 'GET',
      agentId
    });
  }

  async createDevice(deviceData: any, agentId: string): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/devices',
      method: 'POST',
      data: deviceData,
      agentId
    });
  }

  async updateDevice(deviceId: string, updates: any, agentId?: string): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: `/devices/${deviceId}`,
      method: 'PUT',
      data: updates,
      agentId
    });
  }

  async deleteDevice(deviceId: string, agentId?: string): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: `/devices/${deviceId}`,
      method: 'DELETE',
      agentId
    });
  }

  // Agent Management through Gateway
  async getAgents(): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/agents',
      method: 'GET'
    });
  }

  async getAgentStatus(agentId: string): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: `/agents/${agentId}/status`,
      method: 'GET',
      agentId
    });
  }

  async sendAgentCommand(agentId: string, command: any): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: `/agents/${agentId}/commands`,
      method: 'POST',
      data: command,
      agentId
    });
  }

  // Telemetry through Gateway
  async uploadTelemetry(telemetryData: any, agentId?: string): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/telemetry',
      method: 'POST',
      data: telemetryData,
      agentId
    });
  }

  async queryTimeSeries(query: any): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/data/timeseries',
      method: 'GET',
      data: query
    });
  }

  // MCP Operations through Gateway
  async getMCPStatus(): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/mcp/status',
      method: 'GET'
    });
  }

  async coordinateAgents(coordinationRequest: any): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/mcp/coordinate',
      method: 'POST',
      data: coordinationRequest
    });
  }

  async processEvent(eventData: any): Promise<IoTMeshGatewayResponse> {
    return this.makeRequest({
      endpoint: '/mcp/events',
      method: 'POST',
      data: eventData
    });
  }

  // Authentication through Gateway
  async registerAgent(agentData: {
    agent_name: string;
    agent_type: string;
    capabilities: string[];
  }): Promise<IoTMeshGatewayResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('iot-agent-auth', {
        body: {
          action: 'register_agent',
          ...agentData
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Agent registration failed');
      }

      return {
        data: response.data,
        status: 201
      };

    } catch (error) {
      console.error('Agent registration error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  async authenticateAgent(agentId: string): Promise<IoTMeshGatewayResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('iot-agent-auth', {
        body: {
          action: 'authenticate_agent',
          agent_id: agentId
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Agent authentication failed');
      }

      return {
        data: response.data,
        status: 200
      };

    } catch (error) {
      console.error('Agent authentication error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  async revokeAgent(agentId: string): Promise<IoTMeshGatewayResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session');
      }

      const response = await supabase.functions.invoke('iot-agent-auth', {
        body: {
          action: 'revoke_agent',
          agent_id: agentId
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Agent revocation failed');
      }

      return {
        data: response.data,
        status: 200
      };

    } catch (error) {
      console.error('Agent revocation error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }
}

export const iotAgentMeshGatewayService = new IoTAgentMeshGatewayService();