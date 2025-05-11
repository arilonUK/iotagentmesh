
import React from 'react';
import { ProductService } from '@/types/product';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface ServiceListProps {
  services: ProductService[];
  isLoading: boolean;
  onEdit: (service: ProductService) => void;
  onDelete: (serviceId: string) => void;
  onToggle: (serviceId: string, enabled: boolean) => void;
}

export function ServiceList({ 
  services, 
  isLoading, 
  onEdit, 
  onDelete,
  onToggle
}: ServiceListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading services...</span>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">
            No services configured for this product yet. Add your first service to enable device functionality.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'mqtt':
        return 'bg-blue-100 text-blue-800';
      case 'http':
        return 'bg-purple-100 text-purple-800';
      case 'data_processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'analytics':
        return 'bg-green-100 text-green-800';
      case 'notification':
        return 'bg-red-100 text-red-800';
      case 'storage':
        return 'bg-indigo-100 text-indigo-800';
      case 'custom':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeName = (type: string) => {
    const names: Record<string, string> = {
      mqtt: 'MQTT',
      http: 'HTTP API',
      data_processing: 'Data Processing',
      analytics: 'Analytics',
      notification: 'Notification',
      storage: 'Storage',
      custom: 'Custom'
    };
    return names[type] || 'Unknown';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map(service => (
        <Card key={service.id} className="shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle>{service.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getServiceTypeColor(service.service_type)}>
                    {getServiceTypeName(service.service_type)}
                  </Badge>
                  <Badge variant={service.enabled ? "default" : "outline"}>
                    {service.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
            {service.description && (
              <CardDescription className="mt-2">
                {service.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pb-2">
            {/* Service-specific info preview */}
            <div className="text-sm text-muted-foreground">
              {service.service_type === 'mqtt' && service.config.endpoint && (
                <p>Broker: {service.config.endpoint}</p>
              )}
              {service.service_type === 'http' && service.config.endpoint && (
                <p>Endpoint: {service.config.endpoint}</p>
              )}
              {service.service_type === 'storage' && service.config.retention_days && (
                <p>Retention: {service.config.retention_days} days</p>
              )}
              {service.service_type === 'notification' && 
                service.config.notification_channels && 
                service.config.notification_channels.length > 0 && (
                <p>
                  Channels: {service.config.notification_channels.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4">
            <div className="flex items-center">
              <Switch 
                checked={service.enabled}
                onCheckedChange={(checked) => onToggle(service.id, checked)}
                aria-label={`Toggle ${service.name}`}
              />
              <span className="ml-2 text-xs text-muted-foreground">
                {service.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => onEdit(service)}
              >
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => onDelete(service.id)}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
