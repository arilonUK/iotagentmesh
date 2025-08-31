import { z } from 'zod';

const emailEndpointSchema = z.object({
  to: z.array(z.string()),
  subject: z.string(),
  body_template: z.string(),
});

const telegramEndpointSchema = z.object({
  bot_token: z.string(),
  chat_id: z.string(),
  message_template: z.string(),
});

const webhookEndpointSchema = z.object({
  url: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  headers: z.record(z.string()).optional(),
  body_template: z.string().optional(),
});

const deviceActionEndpointSchema = z.object({
  target_device_id: z.string(),
  action: z.string(),
  parameters: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

const iftttEndpointSchema = z.object({
  webhook_key: z.string(),
  event_name: z.string(),
  value1: z.string().optional(),
  value2: z.string().optional(),
  value3: z.string().optional(),
});

const whatsappEndpointSchema = z.object({
  phone_number_id: z.string(),
  access_token: z.string(),
  to_phone_number: z.string(),
  message_template: z.string(),
});

export const endpointConfigurationSchema = z.union([
  emailEndpointSchema,
  telegramEndpointSchema,
  webhookEndpointSchema,
  deviceActionEndpointSchema,
  iftttEndpointSchema,
  whatsappEndpointSchema,
]);

export type EndpointConfiguration = z.infer<typeof endpointConfigurationSchema>;

