
import { Badge } from '@/components/ui/badge';
import { AlarmStatus } from '@/types/alarm';

interface AlarmStatusBadgeProps {
  status: AlarmStatus;
}

export function AlarmStatusBadge({ status }: AlarmStatusBadgeProps) {
  switch (status) {
    case 'active':
      return <Badge variant="destructive">Active</Badge>;
    case 'acknowledged':
      return <Badge variant="default">Acknowledged</Badge>;
    case 'resolved':
      return <Badge variant="secondary">Resolved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
