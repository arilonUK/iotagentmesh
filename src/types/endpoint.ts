
import { z } from 'zod';

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

export type EndpointParameterValue = string | number | boolean | null;
export type EndpointParameters = Record<string, EndpointParameterValue>;

export function isEndpointParameters(value: unknown): value is EndpointParameters {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value as Record<string, unknown>).every(
      (v) =>
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        v === null
    )
  );
}

export interface DeviceActionEndpointConfig {
  target_device_id: string;
  action: string;
  parameters?: EndpointParameters;
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

// Zod schemas for runtime validation

const endpointParameterValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const endpointParametersSchema = z.record(endpointParameterValueSchema);

const emailEndpointConfigSchema: z.ZodType<EmailEndpointConfig> = z.object({
  to: z.array(z.string()),
  subject: z.string(),
  body_template: z.string(),
});

const telegramEndpointConfigSchema: z.ZodType<TelegramEndpointConfig> = z.object({
  bot_token: z.string(),
  chat_id: z.string(),
  message_template: z.string(),
});

const webhookEndpointConfigSchema: z.ZodType<WebhookEndpointConfig> = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  headers: z.record(z.string()).optional(),
  body_template: z.string().optional(),
});

const deviceActionEndpointConfigSchema: z.ZodType<DeviceActionEndpointConfig> = z.object({
  target_device_id: z.string(),
  action: z.string(),
  parameters: endpointParametersSchema.optional(),
});

const iftttEndpointConfigSchema: z.ZodType<IftttEndpointConfig> = z.object({
  webhook_key: z.string(),
  event_name: z.string(),
  value1: z.string().optional(),
  value2: z.string().optional(),
  value3: z.string().optional(),
});

const whatsappEndpointConfigSchema: z.ZodType<WhatsappEndpointConfig> = z.object({
  phone_number_id: z.string(),
  access_token: z.string(),
  to_phone_number: z.string(),
  message_template: z.string(),
});

export const endpointConfigurationSchema: z.ZodType<EndpointConfig['configuration']> = z.union([
  emailEndpointConfigSchema,
  telegramEndpointConfigSchema,
  webhookEndpointConfigSchema,
  deviceActionEndpointConfigSchema,
  iftttEndpointConfigSchema,
  whatsappEndpointConfigSchema,
]);
