import { iotAgentMeshApiService, IoTAgent, IoTDevice, TelemetryData, MCPStatus } from './iotAgentMeshApiService';

export interface IoTAgentMeshCollection {
  id: string;
  name: string;
  description: string;
  endpoints: IoTAgentMeshEndpoint[];
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface IoTAgentMeshEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'device_management' | 'agent_communication' | 'data_collection' | 'mcp';
  parameters: EndpointParameter[];
  headers: Record<string, string>;
  body_template?: string;
  response_example?: any;
}

export interface EndpointParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default_value?: any;
  enum_values?: string[];
}

export class IoTAgentMeshCollectionService {
  private readonly collections: Map<string, IoTAgentMeshCollection> = new Map();

  constructor() {
    this.initializeDefaultCollections();
  }

  private initializeDefaultCollections(): void {
    const defaultCollection = this.createDefaultCollection();
    this.collections.set(defaultCollection.id, defaultCollection);
  }

  private createDefaultCollection(): IoTAgentMeshCollection {
    return {
      id: 'iot-agent-mesh-v1',
      name: 'IoT Agent Mesh API v1.0',
      description: 'Complete collection for IoT Agent Mesh API endpoints',
      variables: {
        base_url: 'https://api.iotagentmesh.com/v1',
        api_key: '{{IOT_AGENT_MESH_API_KEY}}',
        timeout: '30000'
      },
      endpoints: [
        // Device Management Endpoints
        {
          id: 'register-device',
          name: 'Register Device',
          description: 'Register a new IoT device with the mesh',
          method: 'POST',
          path: '/devices',
          category: 'device_management',
          parameters: [
            {
              name: 'agent_id',
              type: 'string',
              required: true,
              description: 'ID of the agent managing this device'
            },
            {
              name: 'name',
              type: 'string',
              required: true,
              description: 'Human-readable device name'
            },
            {
              name: 'type',
              type: 'string',
              required: true,
              description: 'Device type (sensor, actuator, gateway, etc.)'
            },
            {
              name: 'properties',
              type: 'object',
              required: false,
              description: 'Device-specific properties and configuration'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            agent_id: '{{agent_id}}',
            name: '{{device_name}}',
            type: '{{device_type}}',
            properties: {
              model: '{{device_model}}',
              firmware_version: '{{firmware_version}}'
            },
            telemetry_config: {
              interval: 30,
              metrics: ['temperature', 'humidity', 'battery_level']
            }
          }, null, 2),
          response_example: {
            device: {
              id: 'device_123',
              agent_id: 'agent_456',
              name: 'Temperature Sensor 01',
              type: 'temperature_sensor',
              status: 'active',
              created_at: '2025-01-09T10:00:00Z'
            }
          }
        },
        {
          id: 'get-device-status',
          name: 'Get Device Status',
          description: 'Retrieve current status of a specific device',
          method: 'GET',
          path: '/devices/{device_id}',
          category: 'device_management',
          parameters: [
            {
              name: 'device_id',
              type: 'string',
              required: true,
              description: 'Unique device identifier'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}'
          },
          response_example: {
            device: {
              id: 'device_123',
              name: 'Temperature Sensor 01',
              status: 'active',
              last_reading: '2025-01-09T10:30:00Z',
              battery_level: 85
            }
          }
        },
        {
          id: 'update-device',
          name: 'Update Device',
          description: 'Update device configuration and properties',
          method: 'PUT',
          path: '/devices/{device_id}',
          category: 'device_management',
          parameters: [
            {
              name: 'device_id',
              type: 'string',
              required: true,
              description: 'Unique device identifier'
            },
            {
              name: 'name',
              type: 'string',
              required: false,
              description: 'Updated device name'
            },
            {
              name: 'status',
              type: 'string',
              required: false,
              description: 'Device status',
              enum_values: ['active', 'inactive', 'error']
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            name: '{{device_name}}',
            status: '{{device_status}}',
            properties: {
              location: '{{device_location}}'
            }
          }, null, 2)
        },

        // Agent Communication Endpoints
        {
          id: 'register-agent',
          name: 'Register Agent',
          description: 'Register a new IoT agent in the mesh',
          method: 'POST',
          path: '/agents',
          category: 'agent_communication',
          parameters: [
            {
              name: 'name',
              type: 'string',
              required: true,
              description: 'Agent name'
            },
            {
              name: 'type',
              type: 'string',
              required: true,
              description: 'Agent type',
              enum_values: ['device', 'gateway', 'edge']
            },
            {
              name: 'endpoint',
              type: 'string',
              required: true,
              description: 'Agent communication endpoint URL'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            name: '{{agent_name}}',
            type: '{{agent_type}}',
            endpoint: '{{agent_endpoint}}',
            capabilities: ['telemetry', 'commands', 'discovery']
          }, null, 2)
        },
        {
          id: 'send-agent-command',
          name: 'Send Agent Command',
          description: 'Send a command to a specific agent',
          method: 'POST',
          path: '/agents/{agent_id}/commands',
          category: 'agent_communication',
          parameters: [
            {
              name: 'agent_id',
              type: 'string',
              required: true,
              description: 'Target agent identifier'
            },
            {
              name: 'command',
              type: 'string',
              required: true,
              description: 'Command to execute'
            },
            {
              name: 'parameters',
              type: 'object',
              required: false,
              description: 'Command parameters'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            command: '{{command_name}}',
            parameters: {
              target_device: '{{device_id}}',
              value: '{{command_value}}'
            },
            timeout: 30
          }, null, 2)
        },
        {
          id: 'get-agent-status',
          name: 'Get Agent Status',
          description: 'Retrieve current status of a specific agent',
          method: 'GET',
          path: '/agents/{agent_id}/status',
          category: 'agent_communication',
          parameters: [
            {
              name: 'agent_id',
              type: 'string',
              required: true,
              description: 'Agent identifier'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}'
          },
          response_example: {
            status: 'online',
            last_seen: '2025-01-09T10:30:00Z',
            connected_devices: 5,
            commands_processed: 127
          }
        },

        // Data Collection Endpoints
        {
          id: 'upload-telemetry',
          name: 'Upload Telemetry',
          description: 'Upload telemetry data from devices',
          method: 'POST',
          path: '/telemetry',
          category: 'data_collection',
          parameters: [
            {
              name: 'device_id',
              type: 'string',
              required: true,
              description: 'Source device identifier'
            },
            {
              name: 'metrics',
              type: 'object',
              required: true,
              description: 'Telemetry metrics and values'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            device_id: '{{device_id}}',
            timestamp: '2025-01-09T10:30:00Z',
            metrics: {
              temperature: {
                value: 23.5,
                unit: 'celsius',
                quality: 'good'
              },
              humidity: {
                value: 65.2,
                unit: 'percent',
                quality: 'good'
              }
            }
          }, null, 2)
        },
        {
          id: 'get-sensor-data',
          name: 'Get Sensor Data',
          description: 'Retrieve sensor data for a specific device',
          method: 'POST',
          path: '/sensors/{sensor_id}/data',
          category: 'data_collection',
          parameters: [
            {
              name: 'sensor_id',
              type: 'string',
              required: true,
              description: 'Sensor identifier'
            },
            {
              name: 'start_time',
              type: 'string',
              required: false,
              description: 'Start time for data query (ISO 8601)'
            },
            {
              name: 'end_time',
              type: 'string',
              required: false,
              description: 'End time for data query (ISO 8601)'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            start_time: '{{start_time}}',
            end_time: '{{end_time}}',
            aggregation: 'avg',
            interval: '1h'
          }, null, 2)
        },
        {
          id: 'query-timeseries',
          name: 'Query Time Series',
          description: 'Query time-series data with advanced filtering',
          method: 'GET',
          path: '/data/timeseries',
          category: 'data_collection',
          parameters: [
            {
              name: 'device_id',
              type: 'string',
              required: true,
              description: 'Device identifier'
            },
            {
              name: 'metric',
              type: 'string',
              required: true,
              description: 'Metric name'
            },
            {
              name: 'start_time',
              type: 'string',
              required: true,
              description: 'Query start time'
            },
            {
              name: 'end_time',
              type: 'string',
              required: true,
              description: 'Query end time'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}'
          }
        },

        // MCP (Multi-Agent Control Platform) Endpoints
        {
          id: 'get-mcp-status',
          name: 'Get MCP Server Status',
          description: 'Retrieve status of the Multi-Agent Control Platform server',
          method: 'GET',
          path: '/mcp/status',
          category: 'mcp',
          parameters: [],
          headers: {
            'Authorization': 'Bearer {{api_key}}'
          },
          response_example: {
            server_id: 'mcp_server_001',
            status: 'running',
            agents_connected: 15,
            events_processed: 1247,
            last_heartbeat: '2025-01-09T10:30:00Z'
          }
        },
        {
          id: 'coordinate-agents',
          name: 'Coordinate Agents',
          description: 'Coordinate multiple agents for complex operations',
          method: 'POST',
          path: '/mcp/coordinate',
          category: 'mcp',
          parameters: [
            {
              name: 'agent_ids',
              type: 'array',
              required: true,
              description: 'List of agent IDs to coordinate'
            },
            {
              name: 'coordination',
              type: 'object',
              required: true,
              description: 'Coordination configuration'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            agent_ids: ['agent_001', 'agent_002', 'agent_003'],
            coordination: {
              type: 'synchronized_action',
              action: 'collect_readings',
              schedule: '2025-01-09T11:00:00Z',
              parameters: {
                metrics: ['temperature', 'humidity'],
                duration: 300
              }
            }
          }, null, 2)
        },
        {
          id: 'process-mcp-event',
          name: 'Process MCP Event',
          description: 'Submit an event for processing by the MCP',
          method: 'POST',
          path: '/mcp/events',
          category: 'mcp',
          parameters: [
            {
              name: 'event_type',
              type: 'string',
              required: true,
              description: 'Type of event to process'
            },
            {
              name: 'source_agent_id',
              type: 'string',
              required: true,
              description: 'ID of the agent generating the event'
            },
            {
              name: 'payload',
              type: 'object',
              required: true,
              description: 'Event payload data'
            }
          ],
          headers: {
            'Authorization': 'Bearer {{api_key}}',
            'Content-Type': 'application/json'
          },
          body_template: JSON.stringify({
            event_type: 'device_alert',
            source_agent_id: '{{source_agent_id}}',
            target_agent_ids: ['{{target_agent_id}}'],
            payload: {
              device_id: '{{device_id}}',
              alert_type: 'threshold_exceeded',
              metric: 'temperature',
              value: 85.5,
              threshold: 80.0
            },
            priority: 'high'
          }, null, 2)
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  getCollection(id: string): IoTAgentMeshCollection | null {
    return this.collections.get(id) || null;
  }

  getAllCollections(): IoTAgentMeshCollection[] {
    return Array.from(this.collections.values());
  }

  getEndpointsByCategory(collectionId: string, category: string): IoTAgentMeshEndpoint[] {
    const collection = this.getCollection(collectionId);
    if (!collection) return [];
    
    return collection.endpoints.filter(endpoint => endpoint.category === category);
  }

  getEndpoint(collectionId: string, endpointId: string): IoTAgentMeshEndpoint | null {
    const collection = this.getCollection(collectionId);
    if (!collection) return null;
    
    return collection.endpoints.find(endpoint => endpoint.id === endpointId) || null;
  }

  generatePostmanCollection(collectionId: string): any {
    const collection = this.getCollection(collectionId);
    if (!collection) return null;

    const postmanCollection = {
      info: {
        name: collection.name,
        description: collection.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      variable: Object.entries(collection.variables).map(([key, value]) => ({
        key,
        value,
        type: 'string'
      })),
      item: this.generatePostmanItems(collection.endpoints)
    };

    return postmanCollection;
  }

  private generatePostmanItems(endpoints: IoTAgentMeshEndpoint[]): Record<string, unknown>[] {
    const categories = [...new Set(endpoints.map(e => e.category))];
    
    return categories.map(category => ({
      name: this.formatCategoryName(category),
      item: endpoints
        .filter(endpoint => endpoint.category === category)
        .map(endpoint => ({
          name: endpoint.name,
          request: {
            method: endpoint.method,
            header: Object.entries(endpoint.headers).map(([key, value]) => ({
              key,
              value,
              type: 'text'
            })),
            url: {
              raw: `{{base_url}}${endpoint.path}`,
              host: ['{{base_url}}'],
              path: endpoint.path.split('/').filter(Boolean)
            },
            body: endpoint.body_template ? {
              mode: 'raw',
              raw: endpoint.body_template,
              options: {
                raw: {
                  language: 'json'
                }
              }
            } : undefined,
            description: endpoint.description
          },
          response: endpoint.response_example ? [{
            name: 'Success Response',
            originalRequest: {},
            status: 'OK',
            code: 200,
            _postman_previewlanguage: 'json',
            header: [],
            cookie: [],
            body: JSON.stringify(endpoint.response_example, null, 2)
          }] : []
        }))
    }));
  }

  private formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  downloadPostmanCollection(collectionId: string): void {
    const postmanCollection = this.generatePostmanCollection(collectionId);
    if (!postmanCollection) return;

    const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${postmanCollection.info.name.replace(/[^a-zA-Z0-9]/g, '_')}.postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Integration with the IoT Agent Mesh API Service
  async testConnection(): Promise<boolean> {
    try {
      const status = await iotAgentMeshApiService.getMCPStatus();
      return status !== null;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getActiveAgents(): Promise<IoTAgent[]> {
    return iotAgentMeshApiService.fetchAll();
  }

  async getConnectedDevices(): Promise<IoTDevice[]> {
    return iotAgentMeshApiService.getDevices();
  }

  async getMCPServerStatus(): Promise<MCPStatus | null> {
    return iotAgentMeshApiService.getMCPStatus();
  }
}

// Create singleton instance
export const iotAgentMeshCollectionService = new IoTAgentMeshCollectionService();