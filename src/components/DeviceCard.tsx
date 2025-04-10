
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Circle } from 'lucide-react';

interface DeviceCardProps {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  lastActive: string;
}

const statusColors = {
  online: 'bg-iot-success',
  offline: 'bg-iot-gray',
  warning: 'bg-iot-warning',
};

const DeviceCard: React.FC<DeviceCardProps> = ({ id, name, type, status, lastActive }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{name}</CardTitle>
          <Badge variant={status === 'online' ? 'default' : 'secondary'} className="ml-2">
            <Circle className={`h-2 w-2 mr-1 ${statusColors[status]}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div className="grid gap-1">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium text-foreground">{type}</span>
          </div>
          <div className="flex justify-between">
            <span>Last active:</span>
            <span className="font-medium text-foreground">{lastActive}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link 
          to={`/dashboard/devices/${id}`}
          className="text-sm text-primary flex items-center hover:underline w-full justify-end"
        >
          View details
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DeviceCard;
