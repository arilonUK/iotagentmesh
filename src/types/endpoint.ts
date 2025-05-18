
export type EndpointType = 'email' | 'telegram' | 'webhook' | 'device_action' | 'ifttt' | 'whatsapp';

export interface EndpointConfig {
  id: string;
  name: string;
  description?: string;
  type: EndpointType;
  organization_id: string;
  enabled: boolean;
  configuration: EmailEndpointConfig | TelegramEndpointConfig | WebhookEndpointConfig | DeviceActionEndpointConfig | IftttEndpointConfig | WhatsappEndpointConfig;
  created_at: string;
  updated_at: string;
}

export interface EmailEndpointConfig {
  to: string[];
  subject: string;
  body_template: string;
}

export interface TelegramEndpointConfig {
  bot_token: string;
  chat_id: string;
  message_template: string;
}

export interface WebhookEndpointConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body_template?: string;
}

export interface DeviceActionEndpointConfig {
  target_device_id: string;
  action: string;
  parameters?: Record<string, any>;
}

export interface IftttEndpointConfig {
  webhook_key: string;
  event_name: string;
  value1?: string;
  value2?: string;
  value3?: string;
}

export interface WhatsappEndpointConfig {
  phone_number_id: string;
  access_token: string;
  to_phone_number: string;
  message_template: string;
}

export interface EndpointFormData {
  id?: string; // Added for editing
  name: string;
  description?: string;
  type: EndpointType;
  enabled: boolean;
  configuration: Partial<EmailEndpointConfig | TelegramEndpointConfig | WebhookEndpointConfig | DeviceActionEndpointConfig | IftttEndpointConfig | WhatsappEndpointConfig>;
}
