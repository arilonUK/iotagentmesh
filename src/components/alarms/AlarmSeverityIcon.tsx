
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { AlarmSeverity } from '@/types/alarm';

interface AlarmSeverityIconProps {
  severity: AlarmSeverity;
}

export function AlarmSeverityIcon({ severity }: AlarmSeverityIconProps) {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="text-red-500" />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" />;
    case 'info':
      return <Clock className="text-blue-500" />;
    default:
      return <AlertCircle />;
  }
}
