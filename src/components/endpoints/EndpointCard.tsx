
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Play, Trash2 } from 'lucide-react';
import {
  EndpointConfig,
  EmailEndpointConfig,
  TelegramEndpointConfig,
  WebhookEndpointConfig,
  DeviceActionEndpointConfig,
  IftttEndpointConfig,
  WhatsappEndpointConfig,
  isEndpointParameters,
} from '@/types/endpoint';

// Type guards for endpoint configurations
const isEmailConfig = (config: unknown): config is EmailEndpointConfig => {
  return typeof config === 'object' && config !== null && 'to' in config && 'subject' in config && 'body_template' in config;
};

const isTelegramConfig = (config: unknown): config is TelegramEndpointConfig => {
  return typeof config === 'object' && config !== null && 'bot_token' in config && 'chat_id' in config && 'message_template' in config;
};

const isWebhookConfig = (config: unknown): config is WebhookEndpointConfig => {
  return typeof config === 'object' && config !== null && 'url' in config && 'method' in config;
};

const isDeviceActionConfig = (config: unknown): config is DeviceActionEndpointConfig => {
  if (typeof config !== 'object' || config === null) return false;
  const c = config as DeviceActionEndpointConfig;
  return (
    typeof c.target_device_id === 'string' &&
    typeof c.action === 'string' &&
    (c.parameters === undefined || isEndpointParameters(c.parameters))
  );
};

const isIftttConfig = (config: unknown): config is IftttEndpointConfig => {
  return typeof config === 'object' && config !== null && 'webhook_key' in config && 'event_name' in config;
};

const isWhatsappConfig = (config: unknown): config is WhatsappEndpointConfig => {
  return typeof config === 'object' && config !== null && 'phone_number_id' in config && 'access_token' in config && 'to_phone_number' in config;
};

interface EndpointCardProps {
  endpoint: EndpointConfig;
  onEdit: (endpoint: EndpointConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onTrigger: (id: string) => void;
}

// Endpoint type icons and labels for display
const endpointTypeIcons: Record<string, React.ReactNode> = {
  email: <span className="text-lg">📧</span>,
  telegram: <span className="text-lg">📱</span>,
  webhook: <span className="text-lg">🌐</span>,
  device_action: <span className="text-lg">🔌</span>,
  ifttt: <span className="text-lg">🔄</span>,
  whatsapp: <span className="text-lg">💬</span>,
};

const endpointTypeLabels: Record<string, string> = {
  email: 'Email',
  telegram: 'Telegram',
  webhook: 'Webhook / API',
  device_action: 'Device Action',
  ifttt: 'IFTTT',
  whatsapp: 'WhatsApp',
};

export const EndpointCard = ({ endpoint, onEdit, onDelete, onToggle, onTrigger }: EndpointCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {endpointTypeIcons[endpoint.type] || <span className="text-lg">🔌</span>}
            <CardTitle className="text-lg font-medium">{endpoint.name}</CardTitle>
          </div>
          <Badge variant={endpoint.enabled ? 'default' : 'secondary'}>
            {endpointTypeLabels[endpoint.type] || endpoint.type}
          </Badge>
        </div>
        {endpoint.description && (
          <CardDescription className="mt-1">{endpoint.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          {/* Email endpoint details */}
          {endpoint.type === 'email' && isEmailConfig(endpoint.configuration) && (
            <div className="truncate">
              To: {Array.isArray(endpoint.configuration.to) 
                ? endpoint.configuration.to.join(', ') 
                : 'No recipients specified'}
            </div>
          )}
          
          {/* Telegram endpoint details */}
          {endpoint.type === 'telegram' && isTelegramConfig(endpoint.configuration) && (
            <div className="truncate">Chat ID: {endpoint.configuration.chat_id || 'Not specified'}</div>
          )}

          {/* Webhook endpoint details */}
          {endpoint.type === 'webhook' && isWebhookConfig(endpoint.configuration) && (
            <div className="truncate">URL: {endpoint.configuration.url || 'Not specified'}</div>
          )}

          {/* Device action endpoint details */}
          {endpoint.type === 'device_action' && isDeviceActionConfig(endpoint.configuration) && (
            <div className="truncate">Action: {endpoint.configuration.action || 'Not specified'}</div>
          )}

          {/* IFTTT endpoint details */}
          {endpoint.type === 'ifttt' && isIftttConfig(endpoint.configuration) && (
            <div className="truncate">Event: {endpoint.configuration.event_name || 'Not specified'}</div>
          )}
          
          {/* WhatsApp endpoint details */}
          {endpoint.type === 'whatsapp' && isWhatsappConfig(endpoint.configuration) && (
            <div className="truncate">To: {endpoint.configuration.to_phone_number || 'Not specified'}</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Enabled</span>
          <Switch 
            checked={endpoint.enabled} 
            onCheckedChange={(checked) => onToggle(endpoint.id, checked)} 
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onTrigger(endpoint.id)}
            disabled={!endpoint.enabled}
          >
            <Play className="h-4 w-4 mr-1" />
            Test
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(endpoint)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => onDelete(endpoint.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};
