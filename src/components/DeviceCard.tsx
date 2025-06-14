
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Circle } from 'lucide-react';

interface DeviceCardProps {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  last_active_at: string;
}

const statusColors = {
  online: 'bg-iot-success',
  offline: 'bg-iot-gray',
  warning: 'bg-iot-warning',
};

const DeviceCard: React.FC<DeviceCardProps> = ({ id, name, type, status, last_active_at }) => {
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('DeviceCard: Navigating to device details for ID:', id);
    navigate(`/dashboard/devices/${id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-medium flex-1 min-w-0 truncate">{name}</CardTitle>
          <Badge variant={status === 'online' ? 'default' : 'secondary'} className="flex-shrink-0 whitespace-nowrap">
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
            <span className="font-medium text-foreground">{new Date(last_active_at).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button
          onClick={handleViewDetails}
          className="text-sm text-primary flex items-center hover:underline w-full justify-end cursor-pointer"
        >
          View details
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </CardFooter>
    </Card>
  );
};

export default DeviceCard;
