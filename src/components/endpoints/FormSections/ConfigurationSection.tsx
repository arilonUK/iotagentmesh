
import React from 'react';
import { EndpointType, EndpointFormData } from '@/types/endpoint';
import { EmailConfigSection } from './EmailConfigSection';
import { TelegramConfigSection } from './TelegramConfigSection';
import { WebhookConfigSection } from './WebhookConfigSection';
import { DeviceActionConfigSection } from './DeviceActionConfigSection';
import { IftttConfigSection } from './IftttConfigSection';
import { WhatsappConfigSection } from './WhatsappConfigSection';
import { UseFormReturn } from 'react-hook-form';

interface ConfigurationSectionProps {
  type: EndpointType;
  form: UseFormReturn<EndpointFormData>;
}

export function ConfigurationSection({ type, form }: ConfigurationSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="font-medium text-sm">Endpoint Configuration</h3>

      {type === 'email' && <EmailConfigSection form={form} />}
      {type === 'telegram' && <TelegramConfigSection form={form} />}
      {type === 'webhook' && <WebhookConfigSection form={form} />}
      {type === 'device_action' && <DeviceActionConfigSection form={form} />}
      {type === 'ifttt' && <IftttConfigSection form={form} />}
      {type === 'whatsapp' && <WhatsappConfigSection form={form} />}
    </div>
  );
}
