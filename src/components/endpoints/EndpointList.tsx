
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Trash2, Edit, Play, AlertCircle } from 'lucide-react';
import { EndpointConfig, EndpointType, EmailEndpointConfig, TelegramEndpointConfig, WebhookEndpointConfig, DeviceActionEndpointConfig, IftttEndpointConfig } from '@/types/endpoint';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const endpointTypeIcons: Record<string, React.ReactNode> = {
  email: <span className="text-lg">📧</span>,
  telegram: <span className="text-lg">📱</span>,
  webhook: <span className="text-lg">🌐</span>,
  device_action: <span className="text-lg">🔌</span>,
  ifttt: <span className="text-lg">🔄</span>,
};

const endpointTypeLabels: Record<string, string> = {
  email: 'Email',
  telegram: 'Telegram',
  webhook: 'Webhook / API',
  device_action: 'Device Action',
  ifttt: 'IFTTT',
};

// Helper type guard functions
const isEmailConfig = (config: any): config is EmailEndpointConfig => {
  return 'to' in config && 'subject' in config && 'body_template' in config;
};

const isTelegramConfig = (config: any): config is TelegramEndpointConfig => {
  return 'bot_token' in config && 'chat_id' in config && 'message_template' in config;
};

const isWebhookConfig = (config: any): config is WebhookEndpointConfig => {
  return 'url' in config && 'method' in config;
};

const isDeviceActionConfig = (config: any): config is DeviceActionEndpointConfig => {
  return 'target_device_id' in config && 'action' in config;
};

const isIftttConfig = (config: any): config is IftttEndpointConfig => {
  return 'webhook_key' in config && 'event_name' in config;
};

interface EndpointListProps {
  endpoints: EndpointConfig[];
  isLoading: boolean;
  onEdit: (endpoint: EndpointConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onTrigger: (id: string) => void;
}

export default function EndpointList({
  endpoints,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onTrigger
}: EndpointListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!endpoints.length) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No endpoints found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first endpoint.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
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
                {endpoint.type === 'email' && isEmailConfig(endpoint.configuration) && (
                  <div className="truncate">
                    To: {Array.isArray(endpoint.configuration.to) 
                      ? endpoint.configuration.to.join(', ') 
                      : endpoint.configuration.to || 'No recipients specified'}
                  </div>
                )}
                
                {endpoint.type === 'telegram' && isTelegramConfig(endpoint.configuration) && (
                  <div className="truncate">Chat ID: {endpoint.configuration.chat_id || 'Not specified'}</div>
                )}

                {endpoint.type === 'webhook' && isWebhookConfig(endpoint.configuration) && (
                  <div className="truncate">URL: {endpoint.configuration.url || 'Not specified'}</div>
                )}

                {endpoint.type === 'device_action' && isDeviceActionConfig(endpoint.configuration) && (
                  <div className="truncate">Action: {endpoint.configuration.action || 'Not specified'}</div>
                )}

                {endpoint.type === 'ifttt' && isIftttConfig(endpoint.configuration) && (
                  <div className="truncate">Event: {endpoint.configuration.event_name || 'Not specified'}</div>
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
                      onClick={() => handleDeleteClick(endpoint.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Endpoint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this endpoint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
