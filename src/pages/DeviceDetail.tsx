
import { useParams } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevices';
import { Separator } from "@/components/ui/separator";
import DeviceAlarms from '@/components/alarms/DeviceAlarms';
import DeviceStats from '@/components/DeviceStats';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const { device, isLoading, error } = useDevice(id);

  if (isLoading) {
    return <div>Loading device details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!device) {
    return <div>Device not found</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{device.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Type:</strong> {device.type}
            </p>
            <p>
              <strong>ID:</strong> {device.id}
            </p>
            {device.description && (
              <p>
                <strong>Description:</strong> {device.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      {/* Display device statistics */}
      <DeviceStats deviceId={id!} />
      
      <Separator className="my-6" />
      
      <DeviceAlarms deviceId={id!} />
    </div>
  );
}
